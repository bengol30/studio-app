'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('אימייל או סיסמה שגויים');
      setLoading(false);
      return;
    }

    router.push('/admin/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
      <div>
        <label className="block text-sm text-muted mb-1">אימייל</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full bg-primary border border-white/10 rounded-lg px-4 py-2.5 text-primary-text placeholder:text-muted focus:outline-none focus:border-accent"
          placeholder="admin@studio.co.il"
          dir="ltr"
        />
      </div>
      <div>
        <label className="block text-sm text-muted mb-1">סיסמה</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full bg-primary border border-white/10 rounded-lg px-4 py-2.5 text-primary-text placeholder:text-muted focus:outline-none focus:border-accent"
          placeholder="••••••••"
          dir="ltr"
        />
      </div>

      {error && (
        <p className="text-accent text-sm text-right">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
      >
        {loading ? 'מתחבר...' : 'כניסה'}
      </button>

      <p className="text-center text-sm text-muted">
        אין לך חשבון?{' '}
        <a href="/admin/register" className="text-accent hover:underline">
          הרשמה
        </a>
      </p>
    </form>
  );
}
