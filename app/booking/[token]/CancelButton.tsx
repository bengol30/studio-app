'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CancelButton({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  async function handleCancel() {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/bookings/token/${token}`, { method: 'PATCH' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'אירעה שגיאה');
        setLoading(false);
        setConfirmed(false);
        return;
      }

      router.refresh();
    } catch {
      setError('אירעה שגיאה, נסה שוב');
      setLoading(false);
      setConfirmed(false);
    }
  }

  return (
    <div>
      {error && <p className="text-accent text-sm mb-3 text-right">{error}</p>}
      {confirmed && !loading && (
        <p className="text-yellow-400 text-sm mb-3 text-right">
          האם אתה בטוח? לחץ שוב לאישור הביטול
        </p>
      )}
      <button
        onClick={handleCancel}
        disabled={loading}
        className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 ${
          confirmed
            ? 'bg-accent text-white hover:bg-accent/90'
            : 'border border-accent/50 text-accent hover:bg-accent/10'
        }`}
      >
        {loading ? 'מבטל...' : confirmed ? 'אשר ביטול' : 'בטל הזמנה'}
      </button>
    </div>
  );
}
