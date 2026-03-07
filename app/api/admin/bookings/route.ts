import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-server';
import type { BookingStatus } from '@/types';

export async function GET(request: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as BookingStatus | null;
  const date = searchParams.get('date'); // optional filter YYYY-MM-DD

  try {
    const admin = createAdminClient();

    let query = admin
      .from('bookings')
      .select(`
        *,
        services(name),
        packages(name, duration_minutes, price)
      `)
      .eq('is_deleted', false)
      .order('booking_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }
    if (date) {
      query = query.eq('booking_date', date);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
