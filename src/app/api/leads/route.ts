import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { sanitizeString, sanitizeEmail } from '@/lib/security/sanitize';
import { saveLeadToBackup, syncPendingLeadsToSupabase } from '@/lib/leads-backup';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting para prevenir spam de formulário de leads
    const rateLimitResponse = enforceRateLimit(req, 'default');
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    const { 
      name, 
      email, 
      whatsapp, 
      role, 
      students_range, 
      instagram,
      lead_type = 'beta_tester',
      utm_source, 
      utm_medium, 
      utm_campaign 
    } = body;

    const sanitizedName = sanitizeString(name).slice(0, 100);
    const sanitizedEmail = sanitizeEmail(email);

    // Validações básicas
    if (!sanitizedName || sanitizedName.length < 2) {
      return NextResponse.json({ error: 'Nome inválido ou muito curto.' }, { status: 400 });
    }

    if (!sanitizedEmail || !sanitizedEmail.includes('@')) {
      return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 });
    }

    if (!whatsapp || typeof whatsapp !== 'string' || whatsapp.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ error: 'WhatsApp inválido. Forneça DDD + número.' }, { status: 400 });
    }

    const cleanWhatsapp = whatsapp.replace(/\D/g, '');
    const cleanInstagram = instagram ? sanitizeString(instagram).trim().replace(/^@/, '') : null;

    const leadPayload = {
      name: sanitizedName,
      email: sanitizedEmail,
      whatsapp: cleanWhatsapp,
      role: role || 'personal_trainer',
      students_range: students_range || '11_30',
      instagram: cleanInstagram,
      lead_type: lead_type || 'beta_tester',
      utm_source: utm_source || (cleanInstagram ? `ig:${cleanInstagram}` : null),
      utm_medium: utm_medium || lead_type,
      utm_campaign: utm_campaign || null,
      status: 'new',
    };

    // 2. Tentar inserir no Supabase
    let dbSuccess = false;
    let savedLeadId: string | null = null;

    try {
      // Tentativa 1: Inserção completa com colunas novas (instagram e lead_type)
      const res1 = await supabaseAdmin
        .from('coach_leads')
        .insert(leadPayload)
        .select('id')
        .single();

      if (!res1.error && res1.data?.id) {
        dbSuccess = true;
        savedLeadId = res1.data.id;
      } else if (res1.error?.message?.includes('column "instagram"') || res1.error?.message?.includes('column "lead_type"')) {
        // Fallback caso a tabela tenha sido criada com o schema antigo sem essas colunas
        const { instagram: _ig, lead_type: _lt, ...legacyPayload } = leadPayload;
        const res2 = await supabaseAdmin
          .from('coach_leads')
          .insert(legacyPayload)
          .select('id')
          .single();

        if (!res2.error && res2.data?.id) {
          dbSuccess = true;
          savedLeadId = res2.data.id;
        } else {
          console.warn('[API Leads] Erro no Supabase (legacy fallback):', res2.error);
        }
      } else {
        console.warn('[API Leads] Erro no Supabase:', res1.error?.message || res1.error);
      }
    } catch (dbErr) {
      console.error('[API Leads] Exceção ao conectar no Supabase:', dbErr);
    }

    // 3. Se gravou no banco com sucesso, aciona sincronização em background de leads pendentes do buffer
    if (dbSuccess && savedLeadId) {
      // Dispara sync não bloqueante de pendentes
      syncPendingLeadsToSupabase(supabaseAdmin).catch((err) => {
        console.warn('[API Leads] Background sync falhou:', err);
      });

      return NextResponse.json({
        success: true,
        message: 'Candidatura confirmada com sucesso!',
        leadId: savedLeadId,
        storage: 'database',
      });
    }

    // 4. Se o Supabase falhou (tabela inexistente, timeout, etc), salva no buffer de contingência local
    console.log('[API Leads] Salvando no buffer de contingência local para garantir zero perda de leads...');
    const backupLead = await saveLeadToBackup(leadPayload);

    return NextResponse.json({
      success: true,
      message: 'Candidatura recebida e registrada com sucesso!',
      leadId: backupLead.id,
      storage: 'backup_local',
    });

  } catch (err: any) {
    console.error('[API Leads] Exceção crítica inesperada:', err);
    return NextResponse.json(
      { error: 'Falha temporária ao registrar candidatura. Por favor, tente novamente ou fale conosco pelo WhatsApp.' },
      { status: 500 }
    );
  }
}
