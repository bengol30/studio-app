import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ההזמנה נשלחה | Bengo Productions',
};

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  return (
    <main className="min-h-screen bg-primary flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full bg-card rounded-2xl border border-white/10 p-8 text-center">
        <div className="text-5xl mb-4">🎵</div>
        <h1 className="text-2xl font-bold text-primary-text mb-2">ההזמנה נשלחה בהצלחה!</h1>
        <p className="text-muted mb-6">
          קיבלנו את הבקשה שלך. ניצור איתך קשר בהקדם לאישור ההזמנה.
        </p>

        {token && (
          <div className="bg-primary rounded-xl border border-white/10 p-4 mb-6">
            <p className="text-sm text-muted mb-1">קישור אישי להזמנה שלך:</p>
            <Link
              href={`/booking/${token}`}
              className="text-accent hover:underline text-sm break-all"
            >
              {typeof window !== 'undefined'
                ? `${window.location.origin}/booking/${token}`
                : `/booking/${token}`}
            </Link>
            <p className="text-xs text-muted mt-2">שמור את הקישור – תוכל לראות סטטוס ולבטל</p>
          </div>
        )}

        <Link
          href="/"
          className="inline-block bg-accent hover:bg-accent/90 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          חזור לדף הבית
        </Link>
      </div>
    </main>
  );
}
