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

  // Rotas públicas que não necessitam de auth
  if (url.pathname.startsWith('/login') || url.pathname.startsWith('/auth') || url.pathname === '/') {
    return supabaseResponse;
  }

  // Se não autenticado e tentando acessar rotas protegidas
  if (!user && (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/app'))) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Verificação de Role quando usuário está logado
  if (user) {
    // Checar se é profissional usando maybeSingle para não lançar erro PGRST116
    const { data: professional } = await supabase
      .from('professionals')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    const isProfessional = !!professional;

    // Se aluno tentar acessar /dashboard, redireciona para /app
    if (!isProfessional && url.pathname.startsWith('/dashboard')) {
      url.pathname = '/app';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
