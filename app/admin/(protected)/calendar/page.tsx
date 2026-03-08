import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase-admin';
import type { Service } from '@/types';
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

async function getBlockedTimesForMonth(year: number, month: number) {
  const supabase = createAdminClient();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data } = await supabase
    .from('blocked_times')
    .select('*')
    .gte('blocked_date', startDate)
    .lte('blocked_date', endDate)
    .order('start_time');

  return data ?? [];
}

async function getServices(): Promise<Service[]> {
  try {
    const supabase = createAdminClient();
    const { data: services } = await supabase
      .from('services')
      .select('*, packages(*), service_fields(*)')
      .eq('is_active', true)
      .eq('is_deleted', false)
      .order('name');

    return (services ?? []).map(service => ({
      ...service,
      packages: (service.packages ?? [])
        .filter((p: { is_active: boolean; is_deleted: boolean }) => p.is_active && !p.is_deleted)
        .sort((a: { price: number }, b: { price: number }) => a.price - b.price),
      service_fields: (service.service_fields ?? [])
        .sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order),
    }));
  } catch {
    return [];
  }
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

  const [bookings, services, blockedTimes] = await Promise.all([
    getBookingsForMonth(year, month),
    getServices(),
    getBlockedTimesForMonth(year, month),
  ]);

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-text">לוח שנה</h1>
      </div>
      <CalendarClient
        bookings={bookings}
        services={services}
        blockedTimes={blockedTimes}
        year={year}
        month={month}
        view={view}
      />
    </div>
  );
}
