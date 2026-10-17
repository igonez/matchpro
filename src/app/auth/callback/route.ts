import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const roleParam = searchParams.get('role'); // 'professional' | 'student'
  const next = searchParams.get('next');
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.user) {
      const user = data.user;
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário ArenaFitPro';
      const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

      // 1. Verificar registros existentes no banco de dados (Fonte da Verdade)
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

      // Prevenção de Elevação de Privilégio:
      // Se já for aluno cadastrado, NÃO permite transitar para treinador via URL param
      let effectiveRole: 'professional' | 'student';

      if (prof) {
        effectiveRole = 'professional';
      } else if (student) {
        effectiveRole = 'student';
      } else {
        // Usuário novo: define papel inicial baseado na intenção do cadastro
        effectiveRole = roleParam === 'professional' || user.user_metadata?.role === 'professional'
          ? 'professional'
          : 'student';
      }

      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax' as const,
        httpOnly: true,
        secure: isProduction,
      };

      if (effectiveRole === 'professional') {
        if (!prof) {
          await supabase.from('professionals').insert({
            id: user.id,
            full_name: fullName,
            specialty: 'personal_trainer',
          });
        }
        await supabase.auth.updateUser({
          data: { role: 'professional' }
        });
        const redirectRes = NextResponse.redirect(`${origin}${safeNext || '/dashboard'}`);
        redirectRes.cookies.set('arena_role', 'professional', cookieOptions);
        return redirectRes;
      } else {
        if (!student) {
          await supabase.from('students').insert({
            id: user.id,
            full_name: fullName,
            avatar_url: avatarUrl,
          });
        }
        await supabase.auth.updateUser({
          data: { role: 'student' }
        });
        const redirectRes = NextResponse.redirect(`${origin}${safeNext || '/app'}`);
        redirectRes.cookies.set('arena_role', 'student', cookieOptions);
        return redirectRes;
      }
    }
  }

  // Se falhar o exchange, envia de volta ao login
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
