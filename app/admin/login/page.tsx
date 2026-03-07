import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import LoginForm from './LoginForm';

export const metadata = {
  title: 'כניסה למערכת | Bengo Productions',
};

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/admin/dashboard');
  }

  return (
    <main className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card rounded-2xl p-8 border border-white/10 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary-text mb-1">Bengo Productions</h1>
          <p className="text-sm text-muted">כניסה למערכת ניהול</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
