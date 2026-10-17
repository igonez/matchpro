import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error:
        'A alteração manual de status de pagamento pelo painel foi desativada. A liberação de acesso ocorre exclusivamente após pagamento confirmado no checkout do aplicativo.',
    },
    { status: 403 }
  );
}

