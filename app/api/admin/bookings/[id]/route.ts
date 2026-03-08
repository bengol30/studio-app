import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-server';
import { createEvent, deleteEvent } from '@/lib/google-calendar';
import { sendGenericWhatsAppMessage } from '@/lib/whatsapp';

const updateSchema = z.object({
  status: z.enum(['confirmed', 'rejected', 'cancelled']),
  notes_internal: z.string().optional(),
});

type Params = { params: { id: string } };

export async function PATCH(request: NextRequest, { params }: Params) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { status, notes_internal } = parsed.data;
    const admin = createAdminClient();

    // Fetch current booking
    const { data: booking, error: fetchError } = await admin
      .from('bookings')
      .select(`
        *,
        services(name),
        packages(name, duration_minutes)
      `)
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { status };
    if (notes_internal !== undefined) {
      updateData.notes_internal = notes_internal;
    }

    // Google Calendar: create event on confirm, delete on cancel/reject
    if (status === 'confirmed' && process.env.GOOGLE_CLIENT_ID) {
      try {
        const serviceName = (booking.services as { name: string })?.name ?? '';
        const googleEventId = await createEvent(booking, serviceName);
        updateData.google_event_id = googleEventId;
      } catch {
        // Calendar not critical – log but continue
      }
    }

    if (
      (status === 'cancelled' || status === 'rejected') &&
      booking.google_event_id &&
      process.env.GOOGLE_CLIENT_ID
    ) {
      try {
        await deleteEvent(booking.google_event_id);
      } catch {
        // Calendar not critical
      }
      updateData.google_event_id = null;
    }

    // Update booking
    const { data: updated, error: updateError } = await admin
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
    }

    // Notify client via WhatsApp
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';

    if (status === 'confirmed') {
      sendGenericWhatsAppMessage(
        booking.client_name,
        booking.client_phone,
        `שלום ${booking.client_name}! הזמנה שלך אושרה בהצלחה 🎉
תאריך: ${booking.booking_date}
שעה: ${booking.start_time} - ${booking.end_time}
נתראה בקרוב! פרטים: ${siteUrl}/booking/${booking.token}`,
        'booking_confirmed'
      ).catch(() => { });
    } else if (status === 'rejected') {
      sendGenericWhatsAppMessage(
        booking.client_name,
        booking.client_phone,
        `שלום ${booking.client_name}, לצערנו הזמנה שלך לתאריך ${booking.booking_date} לא אושרה.
אנא צור קשר ליד יד או בחר תאריך אחר באתר: ${siteUrl}/book`,
        'booking_rejected'
      ).catch(() => { });
    } else if (status === 'cancelled') {
      sendGenericWhatsAppMessage(
        booking.client_name,
        booking.client_phone,
        `שלום ${booking.client_name}, הזמנה שלך לתאריך ${booking.booking_date} בוטלה.
אנא צור קשר או הזמן מחדש: ${siteUrl}/book`,
        'booking_cancelled_by_admin'
      ).catch(() => { });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
