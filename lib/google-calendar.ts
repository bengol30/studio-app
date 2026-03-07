import type { Booking, ExternalEvent } from '@/types';

// Google Calendar API wrapper
// Full implementation in Task 15 (requires OAuth credentials from Ben)

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  });

  const data = await res.json();
  return data.access_token;
}

export async function createEvent(booking: Booking, serviceName: string): Promise<string> {
  const accessToken = await getAccessToken();
  const calendarId = process.env.GOOGLE_CALENDAR_ID!;

  const startDateTime = `${booking.booking_date}T${booking.start_time}:00`;
  const endDateTime = `${booking.booking_date}T${booking.end_time}:00`;

  const res = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: `${booking.client_name} – ${serviceName}`,
        description: [
          `שירות: ${serviceName}`,
          `לקוח: ${booking.client_name}`,
          `טלפון: ${booking.client_phone}`,
          booking.files_url ? `קבצים: ${booking.files_url}` : null,
        ].filter(Boolean).join('\n'),
        start: { dateTime: startDateTime, timeZone: 'Asia/Jerusalem' },
        end: { dateTime: endDateTime, timeZone: 'Asia/Jerusalem' },
      }),
    }
  );

  const data = await res.json();
  return data.id;
}

export async function deleteEvent(eventId: string): Promise<void> {
  const accessToken = await getAccessToken();
  const calendarId = process.env.GOOGLE_CALENDAR_ID!;

  await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
}

export async function getEvents(from: Date, to: Date): Promise<ExternalEvent[]> {
  const accessToken = await getAccessToken();
  const calendarId = process.env.GOOGLE_CALENDAR_ID!;

  const params = new URLSearchParams({
    timeMin: from.toISOString(),
    timeMax: to.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
  });

  const res = await fetch(
    `${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const data = await res.json();

  return (data.items || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    summary: (item.summary as string) || '',
    start: new Date(
      ((item.start as Record<string, string>)?.dateTime) ||
      ((item.start as Record<string, string>)?.date) || ''
    ),
    end: new Date(
      ((item.end as Record<string, string>)?.dateTime) ||
      ((item.end as Record<string, string>)?.date) || ''
    ),
  }));
}
