import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const isHttps =
    request.nextUrl.protocol === 'https:' ||
    request.headers.get('x-forwarded-proto') === 'https';

  const response = NextResponse.json({ ok: true });
  response.cookies.delete('arena_preview');
  response.cookies.set('arena_preview', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    sameSite: 'lax',
    httpOnly: true,
    secure: isHttps,
  });
  return response;
}
