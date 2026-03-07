import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { triggerWebhook } from '@/lib/make-webhooks';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Params = { params: { token: string } };

export async function GET(_request: NextRequest, { params }: Params) {
  const { token } = params;

  if (!token || !UUID_REGEX.test(token)) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        services(name),
        packages(name, duration_minutes, price)
      `)
      .eq('token', token)
      .eq('is_deleted', false)
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { token } = params;

  if (!token || !UUID_REGEX.test(token)) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    // 1. Fetch booking
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, status, booking_date, start_time, client_name, client_phone')
      .eq('token', token)
      .eq('is_deleted', false)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return NextResponse.json({ error: 'Booking cannot be cancelled' }, { status: 400 });
    }

    // 2. Check cancellation window
    const { data: settingRow } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'cancellation_hours')
      .single();
    const cancellationHours: number = (settingRow?.value as number) ?? 48;

    const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}:00`);
    const hoursUntil = (bookingDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntil < cancellationHours) {
      return NextResponse.json(
        { error: `ביטול אפשרי עד ${cancellationHours} שעות לפני ההזמנה` },
        { status: 400 }
      );
    }

    // 3. Cancel booking
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('token', token);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
    }

    // 4. Trigger webhook (non-blocking)
    triggerWebhook('booking_cancelled', {
      client_name: booking.client_name,
      client_phone: booking.client_phone,
      booking_date: booking.booking_date,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
