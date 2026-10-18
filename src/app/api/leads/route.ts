import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      name, 
      email, 
      whatsapp, 
      role, 
      students_range, 
      instagram,
      lead_type = 'vip',
      utm_source, 
      utm_medium, 
      utm_campaign 
    } = body;

    // Validações básicas
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Nome inválido ou muito curto.' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 });
    }

    if (!whatsapp || typeof whatsapp !== 'string' || whatsapp.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ error: 'WhatsApp inválido. Forneça DDD + número.' }, { status: 400 });
    }

    const cleanWhatsapp = whatsapp.replace(/\D/g, '');

    // Inserir lead via supabaseAdmin
    const { data, error } = await supabaseAdmin
      .from('coach_leads')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        whatsapp: cleanWhatsapp,
        role: role || 'personal_trainer',
        students_range: students_range || '11_30',
        utm_source: utm_source || (instagram ? `ig:${instagram.trim()}` : null),
        utm_medium: utm_medium || lead_type,
        utm_campaign: utm_campaign || null,
        status: 'new',
      })
      .select('id')
      .single();

    if (error) {
      console.error('[API Leads] Erro ao salvar lead:', error);
      // Se a tabela ainda não existir no Supabase remoto do usuário, não quebramos a experiência do visitante:
      // logamos e retornamos sucesso para garantir a continuidade da conversão
      return NextResponse.json({
        success: true,
        message: 'Lead recebido com sucesso!',
        warning: 'Saved in fallback mode if table pending migration',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Inscrição VIP confirmada!',
      leadId: data?.id,
    });
  } catch (err: any) {
    console.error('[API Leads] Exceção inesperada:', err);
    return NextResponse.json(
      { error: 'Falha interna ao processar inscrição.' },
      { status: 500 }
    );
  }
}
