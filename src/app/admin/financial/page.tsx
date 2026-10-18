import { redirect } from 'next/navigation';

export default function AdminFinancialRedirect() {
  redirect('/admin?tab=financial');
}
