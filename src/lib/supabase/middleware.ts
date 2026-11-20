import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { Database } from '@/types/database';
import { isMasterAdmin } from '@/lib/master-auth';

const PUBLIC_PREFIXES = [
  '/login',
  '/mestre',
  '/esqueci-senha',
  '/redefinir-senha',
  '/vip',
  '/beta',
  '/privacidade',
  '/termos',
  '/lgpd',
  '/ajuda',
  '/r/',
  '/join/',
  '/auth',
];

function isPublicRoute(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_PREFIXES.some((prefix) =>
    prefix.endsWith('/')
      ? pathname.startsWith(prefix)
      : pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isProtectedApiRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/api/finance') ||
    pathname.startsWith('/api/ai') ||
    pathname.startsWith('/api/submissions') ||
    pathname.startsWith('/api/audit') ||
    pathname.startsWith('/api/checkout') ||
    pathname.startsWith('/api/master') ||
    pathname.startsWith('/api/admin')
  );
}

function isProtectedPageRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/app') ||
    pathname.startsWith('/admin')
  );
}

function getSafeRelativeRedirect(pathname: string, search: string): string | null {
  const raw = `${pathname}${search}`;
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) {
    return null;
  }
  return raw;
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const hasAuthCookie = request.cookies
    .getAll()
    .some(
      (c) =>
        c.name.startsWith('sb-') &&
        c.name.includes('-auth-token') &&
        !c.name.includes('code-verifier') &&
        Boolean(c.value)
    );

  // Fast-bypass sem chamar Supabase Auth quando não há cookie de sessão
  if (!hasAuthCookie) {
    if (isPublicRoute(pathname)) {
      return NextResponse.next({ request });
    }
    if (isProtectedApiRoute(pathname)) {
      return NextResponse.json(
        { error: 'Acesso negado. Autenticação obrigatória.' },
        { status: 401 }
      );
    }
    if (isProtectedPageRoute(pathname)) {
      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/mestre', request.url));
      }
      const loginUrl = new URL('/login', request.url);
      const safeRedirect = getSafeRelativeRedirect(pathname, request.nextUrl.search);
      if (safeRedirect) {
        loginUrl.searchParams.set('redirect', safeRedirect);
      }
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
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
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  // Rotas públicas (exceto '/' que redireciona usuários logados para o cockpit/app)
  if (isPublicRoute(url.pathname) && url.pathname !== '/') {
    return supabaseResponse;
  }

  // Se não autenticado e tentando acessar rotas de API protegidas
  if (!user && isProtectedApiRoute(url.pathname)) {
    return NextResponse.json(
      { error: 'Acesso negado. Autenticação obrigatória.' },
      { status: 401 }
    );
  }

  // Se não autenticado e tentando acessar páginas protegidas
  if (!user && isProtectedPageRoute(url.pathname)) {
    if (url.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/mestre', request.url));
    }
    const loginUrl = new URL('/login', request.url);
    const safeRedirect = getSafeRelativeRedirect(request.nextUrl.pathname, request.nextUrl.search);
    if (safeRedirect) {
      loginUrl.searchParams.set('redirect', safeRedirect);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Verificação de Role quando usuário está logado
  if (user) {
    let isMaster = isMasterAdmin(user);
    let isProfessional = user.app_metadata?.role === 'professional';

    if ((!isProfessional && !isMaster) || (!isMaster && url.pathname.startsWith('/admin'))) {
      const { data: professional } = await (supabase.from('professionals') as any)
        .select('id, is_master_admin')
        .eq('id', user.id)
        .maybeSingle();

      if (professional) {
        isProfessional = true;
        if (professional.is_master_admin === true) {
          isMaster = true;
        }
      }
    }

    const assignedRole = isMaster ? 'master' : isProfessional ? 'professional' : 'student';
    const isHttps =
      request.nextUrl.protocol === 'https:' ||
      request.headers.get('x-forwarded-proto') === 'https';
    const cookieOptions = {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax' as const,
      httpOnly: true,
      secure: isHttps,
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
    const isPreview = (isProfessional || isMaster) && (hasPreviewParam || hasPreviewCookie);

    if (hasPreviewParam && !hasPreviewCookie && (isProfessional || isMaster)) {
      request.cookies.set('arena_preview', 'true');
      const prevCookies = supabaseResponse.cookies.getAll();
      supabaseResponse = NextResponse.next({ request });
      prevCookies.forEach((c) => supabaseResponse.cookies.set(c));
      supabaseResponse.cookies.set('arena_preview', 'true', {
        path: '/',
        maxAge: 60 * 60 * 24, // 24 horas
        sameSite: 'lax',
        httpOnly: true,
        secure: isHttps,
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
