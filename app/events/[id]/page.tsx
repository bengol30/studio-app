import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import RegisterForm from './RegisterForm';
import type { Event, EventType } from '@/types';
import { createAdminClient } from '@/lib/supabase-admin';
import ClientHeader from '@/components/ClientHeader';

export const dynamic = 'force-dynamic';

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  jam: 'ג\'אם',
  listening: 'האזנה',
  workshop: 'סדנה',
  performance: 'הופעה',
  podcast: 'פודקאסט',
  other: 'אירוע',
};

const EVENT_TYPE_GRADIENTS: Record<EventType, string> = {
  jam: 'from-purple-900/70 to-pink-900/50',
  listening: 'from-emerald-900/70 to-teal-900/50',
  workshop: 'from-blue-900/70 to-cyan-900/50',
  performance: 'from-orange-900/70 to-red-900/50',
  podcast: 'from-gray-800/70 to-slate-900/50',
  other: 'from-accent/30 to-accent/10',
};

const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function formatDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return `${DAYS_HE[d.getDay()]}, ${d.toLocaleDateString('he-IL')}`;
}

async function getRegistrations(eventId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('event_registrations')
    .select('id, client_name, created_at')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });
  return data ?? [];
}

async function getEvent(id: string): Promise<Event | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .neq('status', 'cancelled')
      .single();
    return data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const event = await getEvent(params.id);
  return {
    title: event ? `${event.title} | Bengo Productions` : 'אירוע | Bengo Productions',
  };
}

export default async function EventPage({ params }: { params: { id: string } }) {
  const [event, registrations] = await Promise.all([
    getEvent(params.id),
    getRegistrations(params.id),
  ]);

  if (!event) notFound();

  const isFull = event.status === 'full';
  const spotsLeft = event.max_attendees
    ? event.max_attendees - (event.current_attendees ?? 0)
    : null;
  const typeLabel = EVENT_TYPE_LABELS[event.event_type as EventType] ?? 'אירוע';
  const gradient = EVENT_TYPE_GRADIENTS[event.event_type as EventType] ?? EVENT_TYPE_GRADIENTS.other;
  const imageUrl = (event as Event & { image_url?: string }).image_url;

  return (
    <main className="min-h-screen bg-primary" dir="rtl">
      <ClientHeader />

      {/* Hero image / gradient */}
      <div className={`h-56 md:h-72 relative bg-gradient-to-br ${gradient} overflow-hidden`}>
        {imageUrl && (
          <img src={imageUrl} alt={event.title} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        <div className="absolute bottom-0 right-0 p-6 text-right">
          <span className="text-xs px-2.5 py-1 rounded-full bg-black/50 text-white/80 backdrop-blur-sm mb-2 inline-block">
            {typeLabel}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{event.title}</h1>
          {event.host_name && (
            <p className="text-sm text-white/70 mt-1">עם {event.host_name}</p>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/events" className="text-muted text-sm hover:text-primary-text transition-colors">
            ← חזרה לאירועים
          </Link>
        </div>

        <div className="bg-card rounded-2xl border border-white/10 overflow-hidden mb-6">
          {isFull && (
            <div className="bg-accent/10 border-b border-accent/20 px-6 py-3 text-right">
              <span className="text-accent text-sm font-medium">האירוע מלא</span>
            </div>
          )}

          <div className="divide-y divide-white/10">
            <Row label="תאריך" value={formatDate(event.event_date)} />
            <Row label="שעה" value={event.event_time?.slice(0, 5) ?? ''} />
            {event.location && <Row label="מיקום" value={event.location} />}
            <Row label="מחיר" value={event.price === 0 ? 'חינם' : `₪${event.price}`} />
            {event.max_attendees && (
              <Row
                label="מקומות"
                value={isFull ? 'מלא' : `${spotsLeft} נותרו מתוך ${event.max_attendees}`}
              />
            )}
          </div>

          {event.description && (
            <div className="p-6 border-t border-white/10">
              <p className="text-sm text-muted leading-relaxed text-right">{event.description}</p>
            </div>
          )}
        </div>

        {!isFull ? (
          <div className="bg-card rounded-2xl border border-white/10 p-6">
            <h2 className="font-semibold text-primary-text text-right mb-4">הרשמה לאירוע</h2>
            <RegisterForm eventId={event.id} />
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-white/10 p-6 text-center">
            <p className="text-muted">האירוע מלא – אין מקומות פנויים</p>
          </div>
        )}

        {registrations.length > 0 && (
          <div className="bg-card rounded-2xl border border-white/10 p-6 mt-6">
            <h2 className="font-semibold text-primary-text text-right mb-4">
              נרשמים לאירוע ({registrations.length})
            </h2>
            <div className="flex flex-wrap gap-2 justify-end">
              {registrations.map(reg => (
                <span
                  key={reg.id}
                  className="px-3 py-1.5 bg-primary rounded-full text-sm text-primary-text"
                >
                  {reg.client_name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-white/5 py-8 px-4 text-center mt-12">
        <p className="text-muted text-sm">
          © {new Date().getFullYear()} Bengo Productions · קריית שמונה
        </p>
      </footer>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center px-6 py-3">
      <span className="text-primary-text">{value}</span>
      <span className="text-muted text-sm">{label}</span>
    </div>
  );
}
