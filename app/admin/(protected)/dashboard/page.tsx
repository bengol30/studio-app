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

  const todayStr = new Date().toISOString().slice(0, 10);
  const monthStart = todayStr.slice(0, 7) + '-01'; // YYYY-MM-01
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonthStart = lastMonthDate.toISOString().slice(0, 7) + '-01';

  const [
    { count: pendingCount },
    { count: todayCount },
    { count: clientCount },
    { count: upcomingEventsCount },
    { data: recentBookings },
    { data: thisMonthData },
    { data: lastMonthData },
    { data: allConfirmed },
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending').eq('is_deleted', false),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('booking_date', todayStr).eq('is_deleted', false),
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'open').gte('event_date', todayStr),
    supabase
      .from('bookings')
      .select('id, booking_date, start_time, end_time, client_name, client_phone, status, services(name), packages(name)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('bookings')
      .select('id, packages(price)')
      .in('status', ['confirmed'])
      .eq('is_deleted', false)
      .gte('booking_date', monthStart),
    supabase
      .from('bookings')
      .select('id, packages(price)')
      .in('status', ['confirmed'])
      .eq('is_deleted', false)
      .gte('booking_date', lastMonthStart)
      .lt('booking_date', monthStart),
    supabase
      .from('bookings')
      .select('start_time, booking_date, services(name)')
      .in('status', ['confirmed'])
      .eq('is_deleted', false)
  ]);

  // ─── Insights calculations ─────────────────────────────────────────────────
  const monthlyRevenue = (thisMonthData ?? []).reduce((sum, b) => {
    const pkg = b.packages as unknown as { price?: number } | null;
    return sum + (pkg?.price ?? 0);
  }, 0);

  const lastMonthRevenue = (lastMonthData ?? []).reduce((sum, b) => {
    const pkg = b.packages as unknown as { price?: number } | null;
    return sum + (pkg?.price ?? 0);
  }, 0);

  const revenueGrowth = lastMonthRevenue === 0
    ? (monthlyRevenue > 0 ? 100 : 0)
    : Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);

  const thisMonthBookingsCount = thisMonthData?.length ?? 0;
  const lastMonthBookingsCount = lastMonthData?.length ?? 0;
  const bookingsGrowth = lastMonthBookingsCount === 0
    ? (thisMonthBookingsCount > 0 ? 100 : 0)
    : Math.round(((thisMonthBookingsCount - lastMonthBookingsCount) / lastMonthBookingsCount) * 100);

  const DAYS_HE_SHORT = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const dayCount: Record<number, number> = {};
  const hourCount: Record<number, number> = {};
  const serviceCount: Record<string, number> = {};

  for (const b of allConfirmed ?? []) {
    if (b.booking_date) {
      const d = new Date(`${b.booking_date}T00:00:00`);
      dayCount[d.getDay()] = (dayCount[d.getDay()] ?? 0) + 1;
    }
    if (b.start_time) {
      const h = parseInt((b.start_time as string).slice(0, 2));
      hourCount[h] = (hourCount[h] ?? 0) + 1;
    }
    const svcName = (b.services as unknown as { name?: string } | null)?.name;
    if (svcName) {
      serviceCount[svcName] = (serviceCount[svcName] ?? 0) + 1;
    }
  }

  const peakDayIdx = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  const peakDay = peakDayIdx !== undefined ? `ימי ${DAYS_HE_SHORT[parseInt(peakDayIdx)]}` : '—';

  const peakHourNum = Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  const peakHour = peakHourNum !== undefined ? `${peakHourNum}:00` : '—';

  const topService = Object.entries(serviceCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
  // ──────────────────────────────────────────────────────────────────────────

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

      {/* Insights */}
      <div className="bg-card rounded-xl p-6 border border-white/10 mb-6">
        <h2 className="text-lg font-semibold text-primary-text text-right mb-4">📈 מדדי ביצועים ותובנות</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Revenue */}
          <div className="bg-primary rounded-xl p-5 text-right border border-white/5">
            <p className="text-xs text-muted mb-2">הכנסות החודש (מאושר)</p>
            <div className="flex items-end justify-between flex-row-reverse">
              <p className="text-2xl font-bold text-green-400">₪{monthlyRevenue.toLocaleString('he-IL')}</p>
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${revenueGrowth >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                <span>{revenueGrowth >= 0 ? '↑' : '↓'}</span>
                <span dir="ltr">{Math.abs(revenueGrowth)}%</span>
              </div>
            </div>
            <p className="text-[10px] text-muted mt-2">לעומת חודש שעבר (₪{lastMonthRevenue.toLocaleString('he-IL')})</p>
          </div>

          {/* Bookings volume */}
          <div className="bg-primary rounded-xl p-5 text-right border border-white/5">
            <p className="text-xs text-muted mb-2">מספר הזמנות החודש</p>
            <div className="flex items-end justify-between flex-row-reverse">
              <p className="text-2xl font-bold text-primary-text">{thisMonthBookingsCount}</p>
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${bookingsGrowth >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                <span>{bookingsGrowth >= 0 ? '↑' : '↓'}</span>
                <span dir="ltr">{Math.abs(bookingsGrowth)}%</span>
              </div>
            </div>
            <p className="text-[10px] text-muted mt-2">לעומת חודש שעבר ({lastMonthBookingsCount} הזמנות)</p>
          </div>

          {/* Top Service */}
          <div className="bg-primary rounded-xl p-5 text-right border border-white/5 flex flex-col justify-center">
            <p className="text-xs text-muted mb-2">השירות המוביל</p>
            <p className="text-xl font-bold text-primary-text truncate" title={topService}>{topService}</p>
            <p className="text-[10px] text-muted mt-2">השירות שהוזמן הכי הרבה פעמים</p>
          </div>

          {/* Peak times */}
          <div className="bg-primary rounded-xl p-5 text-right border border-white/5 flex flex-col justify-center">
            <p className="text-xs text-muted mb-2">זמני עומס בסטודיו</p>
            <p className="text-lg font-bold text-primary-text">
              {peakDay} סביב {peakHour}
            </p>
            <p className="text-[10px] text-muted mt-2">השעות והימים הנקבעים ביותר</p>
          </div>

        </div>
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
                      {(b.services as unknown as { name: string } | null)?.name} · {formatDate(b.booking_date)} · {b.start_time?.slice(0, 5)}
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
