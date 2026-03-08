import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-server';
import type { EventType, EventStatus } from '@/types';
import CreateEventForm from '@/components/admin/CreateEventForm';
import EditEventForm from '@/components/admin/EditEventForm';

export const metadata: Metadata = {
  title: 'אירועים | ניהול',
};

export const dynamic = 'force-dynamic';

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  jam: 'ג\'אם',
  listening: 'האזנה',
  workshop: 'סדנה',
  performance: 'הופעה',
  podcast: 'פודקאסט',
  other: 'אחר',
};

const STATUS_TABS = [
  { key: 'open', label: 'פתוחים' },
  { key: 'full', label: 'מלאים' },
  { key: 'cancelled', label: 'בוטלו' },
] as const;

const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function formatDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return `${DAYS_HE[d.getDay()]}, ${d.toLocaleDateString('he-IL')}`;
}

async function getEvents(status: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('status', status)
    .eq('is_deleted', false)
    .order('event_date', { ascending: true });
  return data ?? [];
}

async function getRegistrations(eventId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

async function createEvent(formData: FormData) {
  'use server';
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect('/admin/login');

  const supabase = createAdminClient();
  const maxAttendeesStr = formData.get('max_attendees') as string;
  const customFieldsStr = formData.get('custom_fields') as string;
  let customFields = [];
  try { customFields = customFieldsStr ? JSON.parse(customFieldsStr) : []; } catch { customFields = []; }

  await supabase.from('events').insert({
    title: formData.get('title') as string,
    description: formData.get('description') as string || null,
    event_type: formData.get('event_type') as EventType,
    event_date: formData.get('event_date') as string,
    event_time: formData.get('event_time') as string,
    location: formData.get('location') as string || null,
    price: parseFloat(formData.get('price') as string) || 0,
    max_attendees: maxAttendeesStr ? parseInt(maxAttendeesStr) : null,
    host_name: formData.get('host_name') as string || null,
    image_url: formData.get('image_url') as string || null,
    custom_fields: customFields,
    status: 'open',
  });
  revalidatePath('/admin/events');
  revalidatePath('/events');
  revalidatePath('/');
  redirect('/admin/events');
}

async function updateEvent(formData: FormData) {
  'use server';
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect('/admin/login');

  const id = formData.get('id') as string;
  const maxAttendeesStr = formData.get('max_attendees') as string;
  const supabase = createAdminClient();
  await supabase.from('events').update({
    title: formData.get('title') as string,
    description: formData.get('description') as string || null,
    event_type: formData.get('event_type') as EventType,
    event_date: formData.get('event_date') as string,
    event_time: formData.get('event_time') as string,
    location: formData.get('location') as string || null,
    price: parseFloat(formData.get('price') as string) || 0,
    max_attendees: maxAttendeesStr ? parseInt(maxAttendeesStr) : null,
    host_name: formData.get('host_name') as string || null,
    image_url: formData.get('image_url') as string || null,
  }).eq('id', id);
  revalidatePath('/admin/events');
  revalidatePath('/events');
  revalidatePath('/');
  redirect('/admin/events');
}

async function updateEventStatus(formData: FormData) {
  'use server';
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect('/admin/login');

  const id = formData.get('id') as string;
  const status = formData.get('status') as EventStatus;
  const supabase = createAdminClient();
  await supabase.from('events').update({ status }).eq('id', id);
  revalidatePath('/admin/events');
  revalidatePath('/events');
  revalidatePath('/');
}

async function deleteEvent(formData: FormData) {
  'use server';
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect('/admin/login');

  const id = formData.get('id') as string;
  const supabase = createAdminClient();
  await supabase.from('events').update({ is_deleted: true }).eq('id', id);
  revalidatePath('/admin/events');
  revalidatePath('/events');
  revalidatePath('/');
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { status?: string; view?: string; event?: string; edit?: string };
}) {
  const activeStatus = searchParams.status ?? 'open';
  const showCreate = searchParams.view === 'new';
  const viewEventId = searchParams.event;
  const editEventId = searchParams.edit;

  const events = await getEvents(activeStatus);

  let registrations: Awaited<ReturnType<typeof getRegistrations>> = [];
  let viewedEvent = null;
  if (viewEventId) {
    registrations = await getRegistrations(viewEventId);
    viewedEvent = events.find(e => e.id === viewEventId);
  }

  const editedEvent = editEventId ? events.find(e => e.id === editEventId) : null;

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-primary-text">אירועים</h1>
          <p className="text-muted text-sm mt-1">{events.length} אירועים</p>
        </div>
        <a
          href="/admin/events?view=new"
          className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          + אירוע חדש
        </a>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-card rounded-xl border border-white/10 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <a href="/admin/events" className="text-xs text-muted hover:text-accent">ביטול</a>
            <h2 className="font-semibold text-primary-text">אירוע חדש</h2>
          </div>
          <CreateEventForm createEvent={createEvent} />
        </div>
      )}

      {/* Edit form */}
      {editedEvent && (
        <div className="bg-card rounded-xl border border-accent/20 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <a href={`/admin/events?status=${activeStatus}`} className="text-xs text-muted hover:text-accent">ביטול</a>
            <h2 className="font-semibold text-primary-text">עריכת אירוע – {editedEvent.title}</h2>
          </div>
          <EditEventForm event={editedEvent} updateEvent={updateEvent} />
        </div>
      )}

      {/* Registrations view */}
      {viewedEvent && (
        <div className="bg-card rounded-xl border border-white/10 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <a href="/admin/events" className="text-xs text-muted hover:text-accent">← חזור</a>
            <h2 className="font-semibold text-primary-text">
              רשומים – {viewedEvent.title}
            </h2>
          </div>
          {registrations.length === 0 ? (
            <p className="text-muted text-sm text-center py-4">אין רשומים עדיין</p>
          ) : (
            <div className="space-y-2">
              {registrations.map(reg => (
                <div key={reg.id} className="flex justify-between items-center bg-primary rounded-lg px-4 py-3">
                  <span className="text-xs text-muted">{new Date(reg.created_at).toLocaleDateString('he-IL')}</span>
                  <div className="text-right">
                    <p className="text-sm text-primary-text font-medium">{reg.client_name}</p>
                    <p className="text-xs text-muted">{reg.client_phone}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-card rounded-xl p-1 w-fit border border-white/10">
        {STATUS_TABS.map(tab => (
          <a
            key={tab.key}
            href={`/admin/events?status=${tab.key}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeStatus === tab.key
                ? 'bg-accent/20 text-accent'
                : 'text-muted hover:text-primary-text'
              }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* Events list */}
      {events.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <p className="text-4xl mb-3">🎵</p>
          <p>אין אירועים בסטטוס זה</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(event => (
            <div
              key={event.id}
              className={`bg-card rounded-xl border p-5 transition-colors ${editEventId === event.id ? 'border-accent/30' : 'border-white/10'
                }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2 flex-wrap">
                  {activeStatus === 'open' && (
                    <form action={updateEventStatus}>
                      <input type="hidden" name="id" value={event.id} />
                      <input type="hidden" name="status" value="cancelled" />
                      <button
                        type="submit"
                        className="px-3 py-1.5 border border-white/10 text-muted rounded-lg text-sm hover:text-accent transition-colors"
                      >
                        בטל
                      </button>
                    </form>
                  )}
                  {activeStatus === 'cancelled' && (
                    <form action={updateEventStatus}>
                      <input type="hidden" name="id" value={event.id} />
                      <input type="hidden" name="status" value="open" />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                      >
                        פתח מחדש
                      </button>
                    </form>
                  )}
                  <a
                    href={`/admin/events?status=${activeStatus}&edit=${event.id}`}
                    className="px-3 py-1.5 bg-white/5 text-muted rounded-lg text-sm hover:text-primary-text transition-colors"
                  >
                    ערוך
                  </a>
                  <a
                    href={`/admin/events?status=${activeStatus}&event=${event.id}`}
                    className="px-3 py-1.5 bg-white/5 text-muted rounded-lg text-sm hover:text-primary-text transition-colors"
                  >
                    רשומים ({event.current_attendees ?? 0}
                    {event.max_attendees ? `/${event.max_attendees}` : ''})
                  </a>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-text">{event.title}</p>
                  <p className="text-xs text-muted">
                    {EVENT_TYPE_LABELS[event.event_type as EventType]}
                    {event.host_name ? ` · ${event.host_name}` : ''}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-primary rounded-lg px-3 py-2">
                  <span className="text-muted">תאריך: </span>
                  <span className="text-primary-text">{formatDate(event.event_date)}</span>
                </div>
                <div className="bg-primary rounded-lg px-3 py-2">
                  <span className="text-muted">שעה: </span>
                  <span className="text-primary-text">{event.event_time?.slice(0, 5)}</span>
                </div>
                {event.location && (
                  <div className="bg-primary rounded-lg px-3 py-2">
                    <span className="text-muted">מיקום: </span>
                    <span className="text-primary-text">{event.location}</span>
                  </div>
                )}
                <div className="bg-primary rounded-lg px-3 py-2">
                  <span className="text-muted">מחיר: </span>
                  <span className="text-primary-text">
                    {event.price === 0 ? 'חינם' : `₪${event.price}`}
                  </span>
                </div>
              </div>

              {event.description && (
                <p className="mt-3 text-xs text-muted text-right">{event.description}</p>
              )}

              <div className="mt-3 flex justify-start">
                <form action={deleteEvent}>
                  <input type="hidden" name="id" value={event.id} />
                  <button type="submit" className="text-xs text-muted hover:text-red-400 transition-colors">
                    מחק
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
