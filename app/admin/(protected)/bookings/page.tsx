import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-server';

interface BookingRow {
  id: string;
  client_name: string;
  client_phone: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  dynamic_answers: Record<string, string> | null;
  files_url: string | null;
  services: { name: string } | null;
  packages: { name: string; duration_minutes: number; price: number } | null;
}

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

const DAYS_HE = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

function formatDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return `${DAYS_HE[d.getDay()]}' ${d.toLocaleDateString('he-IL')}`;
}

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

async function updateBookingStatus(formData: FormData) {
  'use server';
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect('/admin/login');

  const id = formData.get('id') as string;
  const status = formData.get('status') as string;
  const supabase = createAdminClient();
  await supabase.from('bookings').update({ status }).eq('id', id);
  revalidatePath('/admin/bookings');
  revalidatePath('/admin/calendar');
  revalidatePath('/admin/dashboard');
  revalidatePath('/booking', 'layout');
}

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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeStatus === tab.key
                ? 'bg-accent/20 text-accent'
                : 'text-muted hover:text-primary-text'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* Bookings list */}
      {bookings.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <p className="text-4xl mb-3">📭</p>
          <p>אין הזמנות בסטטוס זה</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking: BookingRow) => (
            <div
              key={booking.id as string}
              className="bg-card rounded-xl border border-white/10 p-5"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2">
                  {activeStatus === 'pending' && (
                    <>
                      <form action={updateBookingStatus}>
                        <input type="hidden" name="id" value={booking.id as string} />
                        <input type="hidden" name="status" value="confirmed" />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                        >
                          אשר
                        </button>
                      </form>
                      <form action={updateBookingStatus}>
                        <input type="hidden" name="id" value={booking.id as string} />
                        <input type="hidden" name="status" value="rejected" />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-accent/20 text-accent rounded-lg text-sm hover:bg-accent/30 transition-colors"
                        >
                          דחה
                        </button>
                      </form>
                    </>
                  )}
                  {activeStatus === 'confirmed' && (
                    <form action={updateBookingStatus}>
                      <input type="hidden" name="id" value={booking.id as string} />
                      <input type="hidden" name="status" value="cancelled" />
                      <button
                        type="submit"
                        className="px-3 py-1.5 border border-white/10 text-muted rounded-lg text-sm hover:text-accent transition-colors"
                      >
                        בטל
                      </button>
                    </form>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-text">{booking.client_name as string}</p>
                  <p className="text-sm text-muted">{booking.client_phone as string}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-primary rounded-lg px-3 py-2">
                  <span className="text-muted">שירות: </span>
                  <span className="text-primary-text">
                    {(booking.services as { name: string })?.name}
                  </span>
                </div>
                <div className="bg-primary rounded-lg px-3 py-2">
                  <span className="text-muted">חבילה: </span>
                  <span className="text-primary-text">
                    {(booking.packages as { name: string })?.name}
                  </span>
                </div>
                <div className="bg-primary rounded-lg px-3 py-2">
                  <span className="text-muted">תאריך: </span>
                  <span className="text-primary-text">{formatDate(booking.booking_date as string)}</span>
                </div>
                <div className="bg-primary rounded-lg px-3 py-2">
                  <span className="text-muted">שעה: </span>
                  <span className="text-primary-text">
                    {booking.start_time as string} – {booking.end_time as string}
                  </span>
                </div>
              </div>

              {(() => {
                const answers = booking.dynamic_answers as Record<string, string> | null;
                if (!answers || Object.keys(answers).length === 0) return null;
                return (
                  <div className="mt-3 text-xs text-muted">
                    {Object.entries(answers).map(([k, v]) => (
                      <span key={k} className="ml-3">{k}: <span className="text-primary-text">{v}</span></span>
                    ))}
                  </div>
                );
              })()}

              {booking.files_url && (
                <a
                  href={booking.files_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-xs text-accent hover:underline block text-right"
                >
                  פתח קבצים →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
