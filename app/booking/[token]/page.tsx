import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CancelButton from './CancelButton';

export const metadata: Metadata = {
  title: 'פרטי הזמנה | Bengo Productions',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'ממתין לאישור', color: 'text-yellow-400' },
  confirmed: { label: 'מאושר', color: 'text-green-400' },
  cancelled: { label: 'בוטל', color: 'text-muted' },
  rejected: { label: 'נדחה', color: 'text-accent' },
};

const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function formatDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return `${DAYS_HE[d.getDay()]}, ${d.toLocaleDateString('he-IL')}`;
}

async function getBooking(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/bookings/token/${token}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function BookingPage({ params }: { params: { token: string } }) {
  const booking = await getBooking(params.token);

  if (!booking) notFound();

  const status = STATUS_LABELS[booking.status] ?? { label: booking.status, color: 'text-muted' };
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <main className="min-h-screen bg-primary py-10 px-4" dir="rtl">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-muted text-sm hover:text-primary-text transition-colors">
            ← חזור לדף הבית
          </Link>
        </div>

        <div className="bg-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex justify-between items-start">
              <span className={`text-sm font-medium px-3 py-1 rounded-full bg-white/5 ${status.color}`}>
                {status.label}
              </span>
              <h1 className="text-xl font-bold text-primary-text">פרטי הזמנה</h1>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            <Row label="שירות" value={(booking.services as { name: string })?.name ?? ''} />
            <Row label="חבילה" value={(booking.packages as { name: string })?.name ?? ''} />
            <Row label="תאריך" value={formatDate(booking.booking_date)} />
            <Row label="שעה" value={`${booking.start_time} – ${booking.end_time}`} />
            <Row label="לקוח" value={booking.client_name} />
            <Row label="טלפון" value={booking.client_phone} />
            {booking.files_url && (
              <div className="flex justify-between items-center px-6 py-3">
                <a
                  href={booking.files_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline text-sm"
                >
                  פתח קבצים
                </a>
                <span className="text-muted text-sm">קבצים</span>
              </div>
            )}
          </div>

          {canCancel && (
            <div className="p-6 border-t border-white/10">
              <CancelButton token={params.token} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center px-6 py-3">
      <span className="text-primary-text">{value}</span>
      <span className="text-muted text-sm">{label}</span>
    </div>
  );
}
