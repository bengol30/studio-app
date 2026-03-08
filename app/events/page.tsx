import type { Metadata } from 'next';
import Link from 'next/link';
import type { Event, EventType } from '@/types';
import { createAdminClient } from '@/lib/supabase-admin';
import ClientHeader from '@/components/ClientHeader';

export const metadata: Metadata = {
  title: 'אירועים | Bengo Productions',
  description: 'ג\'אמים, סדנאות, הופעות ועוד – אירועים באולפן',
};

export const dynamic = 'force-dynamic';

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  jam: 'ג\'אם',
  listening: 'האזנה',
  workshop: 'סדנה',
  performance: 'הופעה',
  podcast: 'פודקאסט',
  other: 'אירוע',
};

const EVENT_TYPE_ICONS: Record<EventType, string> = {
  jam: '🎸',
  listening: '🎧',
  workshop: '🎛️',
  performance: '🎤',
  podcast: '🎙️',
  other: '🎵',
};

const EVENT_TYPE_GRADIENTS: Record<EventType, string> = {
  jam: 'from-purple-900/60 to-pink-900/40',
  listening: 'from-emerald-900/60 to-teal-900/40',
  workshop: 'from-blue-900/60 to-cyan-900/40',
  performance: 'from-orange-900/60 to-red-900/40',
  podcast: 'from-gray-800/60 to-slate-900/40',
  other: 'from-accent/20 to-accent/5',
};

const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function formatDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return `${DAYS_HE[d.getDay()]}, ${d.toLocaleDateString('he-IL')}`;
}

async function getEvents(): Promise<Event[]> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('is_deleted', false)
      .neq('status', 'cancelled')
      .order('event_date', { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function EventsPage() {
  const events = await getEvents();

  const upcoming = events.filter(e => {
    const eventDate = new Date(`${e.event_date}T${e.event_time}`);
    return eventDate >= new Date();
  });

  const past = events.filter(e => {
    const eventDate = new Date(`${e.event_date}T${e.event_time}`);
    return eventDate < new Date();
  });

  return (
    <main className="min-h-screen bg-primary" dir="rtl">
      <ClientHeader />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-sm text-muted hover:text-primary-text transition-colors">
            ← דף הבית
          </Link>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-primary-text">אירועים</h1>
            <p className="text-muted text-sm mt-1">ג&#39;אמים, סדנאות, הופעות ועוד</p>
          </div>
        </div>

        {upcoming.length === 0 && past.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <p className="text-5xl mb-4">🎵</p>
            <p className="text-lg font-medium text-primary-text mb-2">אין אירועים בקרוב</p>
            <p className="text-sm">בדוק שוב בקרוב</p>
            <Link
              href="/"
              className="mt-6 inline-block text-accent hover:underline text-sm"
            >
              ← חזור לדף הבית
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
                  אירועים קרובים
                </h2>
                <div className="space-y-4">
                  {upcoming.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
                  אירועים שעברו
                </h2>
                <div className="space-y-4 opacity-60">
                  {past.map(event => (
                    <EventCard key={event.id} event={event} past />
                  ))}
                </div>
              </section>
            )}
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

function EventCard({ event, past = false }: { event: Event; past?: boolean }) {
  const typeIcon = EVENT_TYPE_ICONS[event.event_type as EventType] ?? '🎵';
  const typeLabel = EVENT_TYPE_LABELS[event.event_type as EventType] ?? 'אירוע';
  const gradient = EVENT_TYPE_GRADIENTS[event.event_type as EventType] ?? EVENT_TYPE_GRADIENTS.other;
  const isFull = event.status === 'full';
  const spotsLeft = event.max_attendees
    ? event.max_attendees - (event.current_attendees ?? 0)
    : null;

  return (
    <div className="bg-card rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-colors">
      {/* Image / gradient header */}
      <div className={`h-44 relative bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        {(event as Event & { image_url?: string }).image_url ? (
          <img
            src={(event as Event & { image_url?: string }).image_url!}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-6xl opacity-40">{typeIcon}</span>
        )}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-black/50 text-white/80 backdrop-blur-sm">
            {typeLabel}
          </span>
          {isFull && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-accent/80 text-white backdrop-blur-sm">
              מלא
            </span>
          )}
          {spotsLeft !== null && !isFull && spotsLeft <= 5 && spotsLeft > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-400/80 text-black backdrop-blur-sm font-medium">
              {spotsLeft} מקומות
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-primary-text mb-1 text-right">{event.title}</h3>

        {event.host_name && (
          <p className="text-sm text-muted mb-3 text-right">עם {event.host_name}</p>
        )}

        {event.description && (
          <p className="text-sm text-muted mb-4 text-right leading-relaxed line-clamp-2">{event.description}</p>
        )}

        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div className="bg-primary rounded-lg px-3 py-2 text-right">
            <span className="text-muted block text-xs mb-0.5">תאריך</span>
            <span className="text-primary-text">{formatDate(event.event_date)}</span>
          </div>
          <div className="bg-primary rounded-lg px-3 py-2 text-right">
            <span className="text-muted block text-xs mb-0.5">שעה</span>
            <span className="text-primary-text">{event.event_time?.slice(0, 5)}</span>
          </div>
          {event.location && (
            <div className="bg-primary rounded-lg px-3 py-2 text-right">
              <span className="text-muted block text-xs mb-0.5">מיקום</span>
              <span className="text-primary-text">{event.location}</span>
            </div>
          )}
          <div className="bg-primary rounded-lg px-3 py-2 text-right">
            <span className="text-muted block text-xs mb-0.5">מחיר</span>
            <span className="text-primary-text font-semibold">
              {event.price === 0 ? 'חינם' : `₪${event.price}`}
            </span>
          </div>
        </div>

        {!past && !isFull && (
          <Link
            href={`/events/${event.id}`}
            className="block w-full text-center bg-accent hover:bg-accent/90 text-white font-semibold py-2.5 rounded-xl transition-colors"
          >
            הרשמה לאירוע
          </Link>
        )}

        {!past && isFull && (
          <div className="w-full text-center bg-white/5 text-muted font-medium py-2.5 rounded-xl">
            האירוע מלא
          </div>
        )}
      </div>
    </div>
  );
}
