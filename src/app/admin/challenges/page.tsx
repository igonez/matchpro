import { redirect } from 'next/navigation';

export default function AdminChallengesRedirect() {
  redirect('/admin?tab=challenges');
}
