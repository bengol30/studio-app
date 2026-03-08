'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message === 'User already registered' ? 'משתמש עם אימייל זה כבר קיים' : 'שגיאה ביצירת החשבון');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="text-center space-y-4" dir="rtl">
        <div className="text-4xl">✓</div>
        <p className="text-primary-text font-medium">החשבון נוצר בהצלחה!</p>
        <p className="text-muted text-sm">בדוק את תיבת הדואר שלך לאישור האימייל, לאחר מכן תוכל להתחבר.</p>
        <button
          onClick={() => router.push('/admin/login')}
          className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          עבור לדף כניסה
        </button>
      </div>
    );
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
          placeholder="לפחות 6 תווים"
          dir="ltr"
        />
      </div>
      <div>
        <label className="block text-sm text-muted mb-1">אימות סיסמה</label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          className="w-full bg-primary border border-white/10 rounded-lg px-4 py-2.5 text-primary-text placeholder:text-muted focus:outline-none focus:border-accent"
          placeholder="הכנס סיסמה שוב"
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
        {loading ? 'יוצר חשבון...' : 'הרשמה'}
      </button>

      <p className="text-center text-sm text-muted">
        כבר יש לך חשבון?{' '}
        <a href="/admin/login" className="text-accent hover:underline">
          כניסה
        </a>
      </p>
    </form>
  );
}
