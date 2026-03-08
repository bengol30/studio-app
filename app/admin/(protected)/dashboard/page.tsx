import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'דשבורד | Bengo Productions',
};

const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function formatDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return `${DAYS_HE[d.getDay()]}, ${d.toLocaleDateString('he-IL')}`;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'ממתין', color: 'text-yellow-400' },
  confirmed: { label: 'מאושר', color: 'text-green-400' },
  cancelled: { label: 'בוטל', color: 'text-muted' },
  rejected: { label: 'נדחה', color: 'text-accent' },
};

export default async function DashboardPage() {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  const supabase = createAdminClient();

  const today = new Date().toISOString().slice(0, 10);

  const [
    { count: pendingCount },
    { count: todayCount },
    { count: clientCount },
    { count: upcomingEventsCount },
    { data: recentBookings },
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('booking_date', today),
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'open').gte('event_date', today),
    supabase
      .from('bookings')
      .select('id, booking_date, start_time, end_time, client_name, client_phone, status, services(name), packages(name)')
      .order('created_at', { ascending: false })
      .limit(6),
  ]);

  const stats = [
    { label: 'הזמנות ממתינות', value: pendingCount ?? 0, color: 'text-yellow-400', href: '/admin/bookings?status=pending' },
    { label: 'הזמנות היום', value: todayCount ?? 0, color: 'text-accent', href: '/admin/calendar' },
    { label: 'לקוחות', value: clientCount ?? 0, color: 'text-blue-400', href: '/admin/clients' },
    { label: 'אירועים קרובים', value: upcomingEventsCount ?? 0, color: 'text-green-400', href: '/admin/events' },
  ];

  return (
    <div className="p-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-text">שלום 👋</h1>
        <p className="text-muted mt-1">{user?.email}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-card rounded-xl p-5 border border-white/10 hover:border-white/20 transition-colors"
          >
            <p className="text-sm text-muted mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="bg-card rounded-xl p-6 border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <Link href="/admin/bookings" className="text-xs text-accent hover:underline">כל ההזמנות</Link>
          <h2 className="text-lg font-semibold text-primary-text">הזמנות אחרונות</h2>
        </div>
        {!recentBookings || recentBookings.length === 0 ? (
          <p className="text-muted text-sm text-center py-4">אין הזמנות עדיין</p>
        ) : (
          <div className="space-y-2">
            {recentBookings.map((b) => {
              const status = STATUS_LABELS[b.status] ?? { label: b.status, color: 'text-muted' };
              return (
                <div key={b.id} className="flex justify-between items-center bg-primary rounded-lg px-4 py-3">
                  <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                  <div className="text-right">
                    <p className="text-sm text-primary-text font-medium">{b.client_name}</p>
                    <p className="text-xs text-muted">
                      {(b.services as unknown as { name: string } | null)?.name} · {formatDate(b.booking_date)} · {b.start_time?.slice(0,5)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
