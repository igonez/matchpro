import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[Supabase Admin] SUPABASE_SERVICE_ROLE_KEY não configurada. Operações administrativas podem ser restritas pelo RLS.');
}

/**
 * Cliente Supabase com permissões de Service Role (ignora RLS).
 * Usar EXCLUSIVAMENTE no servidor (rotas de API, webhooks e jobs).
 */
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
) as any;
