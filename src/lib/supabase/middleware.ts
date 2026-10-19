import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { Database } from '@/types/database';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  // Rotas públicas de login e auth não redirecionam
  if (
    url.pathname.startsWith('/login') || 
    url.pathname.startsWith('/mestre') || 
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/vip') ||
    url.pathname.startsWith('/beta') ||
    url.pathname.startsWith('/privacidade') ||
    url.pathname.startsWith('/termos')
  ) {
    return supabaseResponse;
  }

  // Se não autenticado e tentando acessar rotas de API protegidas
  if (!user && (
    url.pathname.startsWith('/api/finance') ||
    url.pathname.startsWith('/api/ai') ||
    url.pathname.startsWith('/api/submissions') ||
    url.pathname.startsWith('/api/master') ||
    url.pathname.startsWith('/api/admin')
  )) {
    return NextResponse.json(
      { error: 'Acesso negado. Autenticação obrigatória.' },
      { status: 401 }
    );
  }

  // Se não autenticado e tentando acessar páginas protegidas
  if (!user && (
    url.pathname.startsWith('/dashboard') || 
    url.pathname.startsWith('/app') ||
    url.pathname.startsWith('/admin')
  )) {
    // Se tentava acessar o admin, redireciona para o login do mestre
    if (url.pathname.startsWith('/admin')) {
      url.pathname = '/mestre';
      return NextResponse.redirect(url);
    }
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Verificação de Role quando usuário está logado
  if (user) {
    const isMaster = user.email?.toLowerCase() === 'igor.feroliveira8@gmail.com' ||
      (process.env.MASTER_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).includes(user.email?.toLowerCase() || '') ||
      user.app_metadata?.is_master_admin === true;

    // Apenas app_metadata (imutável pelo cliente) ou registro confirmado no banco
    let isProfessional = user.app_metadata?.role === 'professional';

    if (!isProfessional && !isMaster) {
      const { data: professional } = await (supabase
        .from('professionals') as any)
        .select('id, is_master_admin')
        .eq('id', user.id)
        .maybeSingle();

      if (professional) {
        isProfessional = true;
      }
    }

    const assignedRole = isMaster ? 'master' : isProfessional ? 'professional' : 'student';
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax' as const,
      httpOnly: true,
      secure: isProduction,
    };

    // Bloqueio de segurança: Se NÃO for master e tentar acessar /admin
    if (!isMaster && url.pathname.startsWith('/admin')) {
      const fallbackUrl = isProfessional ? '/dashboard' : '/app';
      return NextResponse.redirect(new URL(fallbackUrl, request.url));
    }

    // Se o usuário acessar a raiz '/'
    if (url.pathname === '/') {
      const targetPath = isMaster ? '/admin' : isProfessional ? '/dashboard' : '/app';
      const redirectRes = NextResponse.redirect(new URL(targetPath, request.url));
      redirectRes.cookies.set('arena_role', assignedRole, cookieOptions);
      return redirectRes;
    }

    // Se aluno tentar acessar /dashboard, redireciona para /app
    if (!isProfessional && !isMaster && url.pathname.startsWith('/dashboard')) {
      const redirectRes = NextResponse.redirect(new URL('/app', request.url));
      redirectRes.cookies.set('arena_role', 'student', cookieOptions);
      return redirectRes;
    }

    // Modo de Simulação / Visão do Aluno para Profissional ou Master
    const hasPreviewParam = url.searchParams.get('preview') === 'true';
    const hasPreviewCookie = request.cookies.get('arena_preview')?.value === 'true';
    const isPreview = hasPreviewParam || hasPreviewCookie;

    if (hasPreviewParam && !hasPreviewCookie) {
      supabaseResponse.cookies.set('arena_preview', 'true', {
        path: '/',
        maxAge: 60 * 60 * 24, // 24 horas
        sameSite: 'lax',
        httpOnly: true,
        secure: isProduction,
      });
    }

    // Se profissional comum tentar acessar /app sem modo de preview explícito, redireciona para o cockpit /dashboard
    if (isProfessional && !isMaster && url.pathname.startsWith('/app') && !isPreview) {
      const redirectRes = NextResponse.redirect(new URL('/dashboard', request.url));
      redirectRes.cookies.set('arena_role', 'professional', cookieOptions);
      return redirectRes;
    }

    // Garante que o cookie de role está sempre sincronizado na resposta
    supabaseResponse.cookies.set('arena_role', assignedRole, cookieOptions);
  }

  return supabaseResponse;
}
