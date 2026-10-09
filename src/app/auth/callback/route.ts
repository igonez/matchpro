import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const roleParam = searchParams.get('role'); // 'professional' | 'student'
  const next = searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.user) {
      const user = data.user;
      const targetRole = roleParam || user.user_metadata?.role || 'student';
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário Arena Fit Pro';
      const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

      // Verificar se já existe perfil em professionals ou students
      const { data: prof } = await supabase
        .from('professionals')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (targetRole === 'professional') {
        if (!prof) {
          await supabase.from('professionals').insert({
            id: user.id,
            full_name: fullName,
            specialty: 'personal_trainer',
          });
        }
        return NextResponse.redirect(`${origin}${next || '/dashboard'}`);
      } else {
        if (!student) {
          await supabase.from('students').insert({
            id: user.id,
            full_name: fullName,
            avatar_url: avatarUrl,
          });
        }
        return NextResponse.redirect(`${origin}${next || '/app'}`);
      }
    }
  }

  // Se falhar o exchange, envia de volta ao login
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

