import { User } from '@supabase/supabase-js';

/**
 * Lista de e-mails com permissão de Super Admin / Master Cockpit.
 * Configurável via variável de ambiente MASTER_ADMIN_EMAILS (separados por vírgula).
 */
export function isMasterAdmin(user: User | null | undefined): boolean {
  if (!user || !user.email) return false;

  const defaultSuperAdmins = ['igor.feroliveira8@gmail.com'];
  const envEmails = process.env.MASTER_ADMIN_EMAILS || '';
  const allowedList = [
    ...defaultSuperAdmins,
    ...envEmails.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean),
  ];

  // E-mail configurado na env ou fallback de desenvolvimento
  const userEmail = user.email.toLowerCase();
  
  if (allowedList.includes(userEmail)) {
    return true;
  }

  // Verifica metadados do usuário no Supabase Auth
  if (user.user_metadata?.is_master_admin === true || user.app_metadata?.is_master_admin === true) {
    return true;
  }

  return false;
}
