import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getEvents } from '@/lib/google-calendar';
import type { Settings, OpeningHours } from '@/types';

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('service_id');
    const date = searchParams.get('date'); // YYYY-MM-DD
    const durationStr = searchParams.get('duration'); // minutes

    if (!serviceId || !date || !durationStr) {
      return NextResponse.json(
        { error: 'Missing required params: service_id, date, duration' },
        { status: 400 }
      );
    }

    const duration = parseInt(durationStr, 10);
    if (isNaN(duration) || duration <= 0) {
      return NextResponse.json({ error: 'Invalid duration' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Get settings (opening hours + buffer)
    const { data: settingsRows } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['opening_hours', 'buffer_minutes']);

    const settingsMap: Record<string, Settings['value']> = {};
    (settingsRows ?? []).forEach(row => {
      settingsMap[row.key] = row.value;
    });

    const openingHours = settingsMap['opening_hours'] as OpeningHours;
    const bufferMinutes = (settingsMap['buffer_minutes'] as number) ?? 10;

    // 2. Get day of week
    const dateObj = new Date(`${date}T00:00:00`);
    const dayName = DAY_NAMES[dateObj.getDay()] as keyof OpeningHours;
    const dayHours = openingHours?.[dayName];

    if (!dayHours || !dayHours.active) {
      return NextResponse.json({ available_slots: [] });
    }

    const openMinutes = timeToMinutes(dayHours.open);
    const closeMinutes = timeToMinutes(dayHours.close);

    // 3. Get existing bookings for this day
    const { data: bookings } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('booking_date', date)
      .not('status', 'in', '("cancelled","rejected")')
      .eq('is_deleted', false);

    // 4. Get Google Calendar events (optional – skip if not configured)
    let externalBlocks: Array<{ start: Date; end: Date }> = [];
    if (process.env.GOOGLE_CLIENT_ID) {
      try {
        const from = new Date(`${date}T00:00:00`);
        const to = new Date(`${date}T23:59:59`);
        externalBlocks = await getEvents(from, to);
      } catch {
        // Google Calendar not configured – ignore
      }
    }

    // 5. Build blocked intervals (in minutes from midnight)
    type Interval = { start: number; end: number };
    const blocked: Interval[] = [];

    for (const booking of bookings ?? []) {
      blocked.push({
        start: timeToMinutes(booking.start_time),
        end: timeToMinutes(booking.end_time) + bufferMinutes,
      });
    }

    for (const event of externalBlocks) {
      const eventDate = event.start.toISOString().split('T')[0];
      if (eventDate === date) {
        const startH = event.start.getHours();
        const startM = event.start.getMinutes();
        const endH = event.end.getHours();
        const endM = event.end.getMinutes();
        blocked.push({
          start: startH * 60 + startM,
          end: endH * 60 + endM + bufferMinutes,
        });
      }
    }

    // 6. Generate 30-minute slots and filter
    const slots: string[] = [];
    for (let start = openMinutes; start + duration <= closeMinutes; start += 30) {
      const end = start + duration;
      const overlaps = blocked.some(b => start < b.end && end > b.start);
      if (!overlaps) {
        slots.push(minutesToTime(start));
      }
    }

    return NextResponse.json({ available_slots: slots });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
