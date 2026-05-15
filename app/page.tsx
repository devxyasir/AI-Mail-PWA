import { redirect } from 'next/navigation';

export default function RootPage() {
  // Always redirect to the main intelligence dashboard
  redirect('/inbox');
}
