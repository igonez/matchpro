import fs from 'fs/promises';
import path from 'path';
import { SupabaseClient } from '@supabase/supabase-js';

export interface LeadPayload {
  id?: string;
  name: string;
  email: string;
  whatsapp: string;
  role: string;
  students_range: string;
  instagram?: string | null;
  lead_type?: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  created_at?: string;
  synced?: boolean;
  status?: string;
}

const BACKUP_DIR = path.join(process.cwd(), 'data');
const BACKUP_FILE = path.join(BACKUP_DIR, 'leads_backup.json');

async function ensureDirectory(): Promise<void> {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  } catch {
    // Diretório já existe
  }
}

/**
 * Lê os leads armazenados no buffer local de contingência.
 */
export async function getBackupLeads(): Promise<LeadPayload[]> {
  try {
    await ensureDirectory();
    const data = await fs.readFile(BACKUP_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return [];
    }
    console.error('[Leads Backup] Erro ao ler backup local:', err);
    return [];
  }
}

/**
 * Salva um lead no arquivo local quando o Supabase estiver indisponível ou tabela pendente.
 */
export async function saveLeadToBackup(lead: Omit<LeadPayload, 'created_at' | 'synced'>): Promise<LeadPayload> {
  await ensureDirectory();
  const leads = await getBackupLeads();

  const newLead: LeadPayload = {
    ...lead,
    id: lead.id || `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    created_at: new Date().toISOString(),
    synced: false,
    status: 'new',
  };

  leads.unshift(newLead);

  try {
    // Escrita atômica temporária para evitar corrupção
    const tempFile = `${BACKUP_FILE}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(leads, null, 2), 'utf-8');
    await fs.rename(tempFile, BACKUP_FILE);
    console.log(`[Leads Backup] Lead salvo com sucesso no buffer local (${newLead.email})`);
    return newLead;
  } catch (err) {
    console.error('[Leads Backup] Falha crítica ao salvar no disco:', err);
    throw err;
  }
}

/**
 * Tenta sincronizar leads locais pendentes com o Supabase quando a tabela estiver ativa.
 */
export async function syncPendingLeadsToSupabase(supabase: SupabaseClient): Promise<{ syncedCount: number; errors: any[] }> {
  const leads = await getBackupLeads();
  const pendingLeads = leads.filter((l) => !l.synced);

  if (pendingLeads.length === 0) {
    return { syncedCount: 0, errors: [] };
  }

  let syncedCount = 0;
  const errors: any[] = [];
  const updatedLeads = [...leads];

  for (const lead of pendingLeads) {
    try {
      const { error } = await supabase.from('coach_leads').insert({
        name: lead.name,
        email: lead.email,
        whatsapp: lead.whatsapp,
        role: lead.role || 'personal_trainer',
        students_range: lead.students_range || '11_30',
        instagram: lead.instagram || null,
        lead_type: lead.lead_type || 'beta_tester',
        utm_source: lead.utm_source || null,
        utm_medium: lead.utm_medium || null,
        utm_campaign: lead.utm_campaign || null,
        status: lead.status || 'new',
      });

      if (error) {
        errors.push({ email: lead.email, error });
      } else {
        const item = updatedLeads.find((l) => l.id === lead.id);
        if (item) item.synced = true;
        syncedCount++;
      }
    } catch (err: any) {
      errors.push({ email: lead.email, error: err.message });
    }
  }

  if (syncedCount > 0) {
    try {
      await fs.writeFile(BACKUP_FILE, JSON.stringify(updatedLeads, null, 2), 'utf-8');
      console.log(`[Leads Backup] ${syncedCount} leads sincronizados com o Supabase com sucesso.`);
    } catch (err) {
      console.error('[Leads Backup] Erro ao atualizar status de sincronização:', err);
    }
  }

  return { syncedCount, errors };
}
