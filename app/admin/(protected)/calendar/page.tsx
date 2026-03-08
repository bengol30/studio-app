import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase-admin';
import CalendarClient from './CalendarClient';

export const metadata: Metadata = {
  title: 'לוח שנה | ניהול',
};

export const dynamic = 'force-dynamic';

async function getBookingsForMonth(year: number, month: number) {
  const supabase = createAdminClient();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // last day of month

  const { data } = await supabase
    .from('bookings')
    .select(`*, services(name), packages(name, duration_minutes)`)
    .gte('booking_date', startDate)
    .lte('booking_date', endDate)
    .in('status', ['pending', 'confirmed'])
    .eq('is_deleted', false)
    .order('start_time');

  return data ?? [];
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { year?: string; month?: string; view?: string };
}) {
  const now = new Date();
  const year = parseInt(searchParams.year ?? String(now.getFullYear()));
  const month = parseInt(searchParams.month ?? String(now.getMonth() + 1));
  const view = searchParams.view ?? 'month';

  const bookings = await getBookingsForMonth(year, month);

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-text">לוח שנה</h1>
      </div>
      <CalendarClient bookings={bookings} year={year} month={month} view={view} />
    </div>
  );
}
