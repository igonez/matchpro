import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { isMasterAdmin } from '@/lib/master-auth';

async function checkAdminAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let authorized = isMasterAdmin(user);
  if (!authorized && user) {
    const { data: prof } = await supabaseAdmin
      .from('professionals')
      .select('is_master_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (prof?.is_master_admin) {
      authorized = true;
    }
  }

  return { authorized, user };
}

// GET: Listar despesas com anúncios
export async function GET(req: NextRequest) {
  try {
    const { authorized } = await checkAdminAuth();
    if (!authorized) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('platform_ad_spend')
      .select('*')
      .order('spend_date', { ascending: false });

    if (error) {
      return NextResponse.json({ spends: [] });
    }

    return NextResponse.json({ spends: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao listar despesas.' }, { status: 500 });
  }
}

// POST: Registrar novo gasto com anúncios
export async function POST(req: NextRequest) {
  try {
    const { authorized } = await checkAdminAuth();
    if (!authorized) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const body = await req.json();
    const { spend_date, platform, amount, campaign_name, notes } = body;

    if (!spend_date || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Data e valor positivo são obrigatórios.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('platform_ad_spend')
      .insert({
        spend_date,
        platform: platform || 'meta_ads',
        amount: Number(amount),
        campaign_name: campaign_name || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[Ad Spend Insert Error]:', error);
      return NextResponse.json({ error: 'Erro ao registrar despesa no banco.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, spend: data });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro interno ao salvar gasto.' }, { status: 500 });
  }
}

// DELETE: Remover registro de gasto
export async function DELETE(req: NextRequest) {
  try {
    const { authorized } = await checkAdminAuth();
    if (!authorized) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID da despesa é obrigatório.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('platform_ad_spend')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Erro ao remover registro.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro interno ao excluir.' }, { status: 500 });
  }
}
