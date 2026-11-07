import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const role = (formData.get('role') as string) || 'coach';

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileExt) ? fileExt : 'jpg';
    const fileName = `${role}_${user.id}_${Date.now()}.${safeExt}`;
    const filePath = `avatars/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from('submissions')
      .upload(filePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('[Avatar Upload API] Erro no storage:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('submissions').getPublicUrl(filePath);

    // Atualizar metadados do usuário
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        avatar_url: publicUrl,
      },
    });

    if (role === 'student') {
      await supabaseAdmin
        .from('students')
        .upsert(
          {
            id: user.id,
            full_name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split('@')[0] ||
              'Atleta',
            avatar_url: publicUrl,
          },
          { onConflict: 'id' }
        );
    } else {
      // Buscar registro existente do profissional para preservar campos e sincronizar brand_logo_url
      const { data: existingProf } = await supabaseAdmin
        .from('professionals')
        .select('id, full_name, brand_logo_url')
        .eq('id', user.id)
        .maybeSingle();

      if (existingProf) {
        await supabaseAdmin
          .from('professionals')
          .update({
            avatar_url: publicUrl,
            brand_logo_url: publicUrl,
          })
          .eq('id', user.id);
      } else {
        await supabaseAdmin.from('professionals').insert({
          id: user.id,
          full_name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'Treinador',
          avatar_url: publicUrl,
          brand_logo_url: publicUrl,
        });
      }
    }

    return NextResponse.json({ publicUrl });
  } catch (err: any) {
    console.error('[Avatar Upload API] Erro inesperado:', err);
    return NextResponse.json(
      { error: err?.message || 'Erro interno ao enviar foto de perfil.' },
      { status: 500 }
    );
  }
}
