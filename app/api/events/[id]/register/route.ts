import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { triggerWebhook } from '@/lib/make-webhooks';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { client_name, client_phone } = body;

    if (!client_name || !client_phone) {
      return NextResponse.json({ error: 'שם וטלפון הם שדות חובה' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check event exists and is open
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', params.id)
      .eq('is_deleted', false)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'אירוע לא נמצא' }, { status: 404 });
    }

    if (event.status !== 'open') {
      return NextResponse.json({ error: 'ההרשמה לאירוע זה סגורה' }, { status: 400 });
    }

    // Check if already registered
    const { data: existing } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', params.id)
      .eq('client_phone', client_phone)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'מספר זה כבר רשום לאירוע' }, { status: 400 });
    }

    // Register
    const { error: regError } = await supabase
      .from('event_registrations')
      .insert({
        event_id: params.id,
        client_name,
        client_phone,
        answers: body.answers ?? null,
      });

    if (regError) {
      return NextResponse.json({ error: regError.message }, { status: 500 });
    }

    // Increment attendees counter
    await supabase
      .from('events')
      .update({ current_attendees: (event.current_attendees ?? 0) + 1 })
      .eq('id', params.id);

    // If now full, update status
    if (event.max_attendees && (event.current_attendees ?? 0) + 1 >= event.max_attendees) {
      await supabase.from('events').update({ status: 'full' }).eq('id', params.id);
    }

    triggerWebhook('event_registered', {
      event_id: params.id,
      event_title: event.title,
      event_date: event.event_date,
      event_time: event.event_time,
      client_name,
      client_phone,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
