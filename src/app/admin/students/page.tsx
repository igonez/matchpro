import { redirect } from 'next/navigation';

export default function AdminStudentsRedirect() {
  redirect('/admin?tab=students');
}
