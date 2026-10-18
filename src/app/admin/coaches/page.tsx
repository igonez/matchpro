import { redirect } from 'next/navigation';

export default function AdminCoachesRedirect() {
  redirect('/admin?tab=coaches');
}
