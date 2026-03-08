'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CustomField {
  label: string;
  field_type: 'text' | 'textarea' | 'select' | 'checkbox';
  is_required: boolean;
  display_order: number;
  options?: string[];
}

interface Props {
  eventId: string;
  customFields?: CustomField[];
}

export default function RegisterForm({ eventId, customFields = [] }: Props) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function setAnswer(label: string, value: string) {
    setAnswers(prev => ({ ...prev, [label]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_name: name, client_phone: phone, answers }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'אירעה שגיאה');
      } else {
        setSuccess(true);
        router.refresh();
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

  const sorted = [...customFields].sort((a, b) => a.display_order - b.display_order);

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

      {/* Dynamic custom fields */}
      {sorted.map((field, idx) => (
        <div key={idx}>
          <label className="block text-xs text-muted mb-1 text-right">
            {field.label} {field.is_required && '*'}
          </label>

          {field.field_type === 'text' && (
            <input
              type="text"
              required={field.is_required}
              value={answers[field.label] ?? ''}
              onChange={e => setAnswer(field.label, e.target.value)}
              className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2.5 text-primary-text text-sm focus:outline-none focus:border-accent"
            />
          )}

          {field.field_type === 'textarea' && (
            <textarea
              required={field.is_required}
              value={answers[field.label] ?? ''}
              onChange={e => setAnswer(field.label, e.target.value)}
              rows={3}
              className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2.5 text-primary-text text-sm focus:outline-none focus:border-accent resize-none"
            />
          )}

          {field.field_type === 'select' && (
            <select
              required={field.is_required}
              value={answers[field.label] ?? ''}
              onChange={e => setAnswer(field.label, e.target.value)}
              className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2.5 text-primary-text text-sm focus:outline-none focus:border-accent"
            >
              <option value="">בחר...</option>
              {(field.options ?? []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {field.field_type === 'checkbox' && (
            <label className="flex items-center gap-2 cursor-pointer justify-end">
              <span className="text-sm text-primary-text">{field.label}</span>
              <input
                type="checkbox"
                required={field.is_required}
                checked={answers[field.label] === 'true'}
                onChange={e => setAnswer(field.label, e.target.checked ? 'true' : 'false')}
                className="accent-accent w-4 h-4"
              />
            </label>
          )}
        </div>
      ))}

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
