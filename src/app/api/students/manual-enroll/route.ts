import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error:
        'A matrícula manual foi desativada. Todas as inscrições e pagamentos devem ser realizados exclusivamente via checkout oficial do aplicativo.',
    },
    { status: 403 }
  );
}

