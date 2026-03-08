'use client';

import { useState } from 'react';

export default function RegisterForm({ eventId }: { eventId: string }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_name: name, client_phone: phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'אירעה שגיאה');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('אירעה שגיאה, נסה שוב');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <p className="text-4xl mb-3">✅</p>
        <p className="font-semibold text-primary-text mb-1">נרשמת בהצלחה!</p>
        <p className="text-sm text-muted">נשמח לראותך באירוע</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
      <div>
        <label className="block text-xs text-muted mb-1 text-right">שם מלא *</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2.5 text-primary-text text-sm focus:outline-none focus:border-accent"
          placeholder="שם מלא"
        />
      </div>
      <div>
        <label className="block text-xs text-muted mb-1 text-right">טלפון *</label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
          className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2.5 text-primary-text text-sm focus:outline-none focus:border-accent"
          placeholder="05X-XXXXXXX"
          dir="ltr"
        />
      </div>

      {error && (
        <p className="text-sm text-accent text-right">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'שולח...' : 'אשר הרשמה'}
      </button>
    </form>
  );
}
