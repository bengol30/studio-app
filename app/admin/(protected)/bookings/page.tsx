import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase-admin';
import AdminBookingsList from './AdminBookingsList';

export const metadata: Metadata = {
  title: 'הזמנות | ניהול',
};

export const dynamic = 'force-dynamic';

const STATUS_TABS = [
  { key: 'pending', label: 'ממתינות' },
  { key: 'confirmed', label: 'מאושרות' },
  { key: 'cancelled', label: 'בוטלו' },
  { key: 'rejected', label: 'נדחו' },
] as const;

async function getBookings(status: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('bookings')
    .select(`*, services(name), packages(name, duration_minutes, price)`)
    .eq('status', status)
    .eq('is_deleted', false)
    .order('booking_date', { ascending: true })
    .order('start_time', { ascending: true });
  return data ?? [];
}

// Actions handled by client side AdminBookingsList API calls

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const activeStatus = searchParams.status ?? 'pending';
  const bookings = await getBookings(activeStatus);

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-text">הזמנות</h1>
        <p className="text-muted text-sm mt-1">{bookings.length} הזמנות</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-card rounded-xl p-1 w-fit border border-white/10">
        {STATUS_TABS.map(tab => (
          <a
            key={tab.key}
            href={`/admin/bookings?status=${tab.key}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeStatus === tab.key
              ? 'bg-accent/20 text-accent'
              : 'text-muted hover:text-primary-text'
              }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* Bookings list component with bulk actions */}
      <AdminBookingsList bookings={bookings} activeStatus={activeStatus} />
    </div>
  );
}
