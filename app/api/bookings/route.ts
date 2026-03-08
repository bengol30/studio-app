import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase-admin';
import { sendGenericWhatsAppMessage } from '@/lib/whatsapp';

const createBookingSchema = z.object({
  service_id: z.string().uuid(),
  package_id: z.string().uuid(),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  client_name: z.string().min(2).max(100),
  client_phone: z.string().regex(/^[\d+\-\s]{7,15}$/),
  answers: z.record(z.string(), z.string()).optional().default({}),
  files_url: z.string().url().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabase = createAdminClient();

    // 1. Fetch package to get duration
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .select('duration_minutes, is_active, is_deleted')
      .eq('id', data.package_id)
      .eq('service_id', data.service_id)
      .single();

    if (pkgError || !pkg || !pkg.is_active || pkg.is_deleted) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    // 2. Fetch buffer_minutes from settings
    const { data: bufferRow } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'buffer_minutes')
      .single();
    const bufferMinutes: number = (bufferRow?.value as number) ?? 10;

    // 3. Server-side availability check
    const [startH, startM] = data.start_time.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = startMinutes + pkg.duration_minutes;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    const end_time = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    const { data: conflicts } = await supabase
      .from('bookings')
      .select('id')
      .eq('booking_date', data.booking_date)
      .not('status', 'in', '("cancelled","rejected")')
      .eq('is_deleted', false)
      .lt('start_time', end_time)
      .gt('end_time', data.start_time);

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({ error: 'Time slot is no longer available' }, { status: 409 });
    }

    // Also check buffer: existing bookings that end within buffer of our start
    const bufferStart = startMinutes - bufferMinutes;
    const bufferStartTime = `${String(Math.floor(bufferStart / 60)).padStart(2, '0')}:${String(bufferStart % 60).padStart(2, '0')}`;

    const { data: bufferConflicts } = await supabase
      .from('bookings')
      .select('id')
      .eq('booking_date', data.booking_date)
      .not('status', 'in', '("cancelled","rejected")')
      .eq('is_deleted', false)
      .gt('end_time', bufferStartTime)
      .lte('end_time', data.start_time);

    if (bufferConflicts && bufferConflicts.length > 0) {
      return NextResponse.json({ error: 'Time slot is no longer available' }, { status: 409 });
    }

    // 4. Upsert client
    await supabase
      .from('clients')
      .upsert({ name: data.client_name, phone: data.client_phone }, { onConflict: 'phone' });

    // 5. Insert booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        service_id: data.service_id,
        package_id: data.package_id,
        booking_date: data.booking_date,
        start_time: data.start_time,
        end_time,
        client_name: data.client_name,
        client_phone: data.client_phone,
        dynamic_answers: data.answers,
        files_url: data.files_url ?? null,
        status: 'pending',
      })
      .select('token')
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }

    // 6. Notify client via WhatsApp (non-blocking)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';

    sendGenericWhatsAppMessage(
      data.client_name,
      data.client_phone,
      'new_booking',
      `שלום ${data.client_name}! הבקשה שלך נתקבלה בהצלחה וממתינה לאישור.
תאריך: ${data.booking_date} | שעה: ${data.start_time} - ${end_time}
סוייננו בקרוב! פרטי ההזמנה: ${siteUrl}/booking/${booking.token}`
    ).catch(() => { });

    return NextResponse.json({ token: booking.token }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
