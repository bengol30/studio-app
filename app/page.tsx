import type { Metadata } from 'next';
import Link from 'next/link';
import type { Service } from '@/types';
import { createAdminClient } from '@/lib/supabase-admin';
import ClientHeader from '@/components/ClientHeader';
import WhatsAppButton from '@/components/WhatsAppButton';

export const metadata: Metadata = {
  title: 'Bengo Productions | אולפן הקלטות קריית שמונה',
  description: 'אולפן הקלטות מקצועי בקריית שמונה. הזמן סטודיו, הקלטת מוזיקה, פודקאסט ועוד.',
};

const EVENT_TYPE_ICONS: Record<string, string> = {
  jam: '🎸', listening: '🎧', workshop: '🎛️', performance: '🎤', podcast: '🎙️', other: '🎵',
};

const EVENT_TYPE_GRADIENTS: Record<string, string> = {
  jam: 'from-purple-900/60 to-pink-900/40',
  listening: 'from-emerald-900/60 to-teal-900/40',
  workshop: 'from-blue-900/60 to-cyan-900/40',
  performance: 'from-orange-900/60 to-red-900/40',
  podcast: 'from-gray-800/60 to-slate-900/40',
  other: 'from-accent/20 to-accent/5',
};

async function getUpcomingEvents() {
  try {
    const supabase = createAdminClient();
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('is_deleted', false)
      .eq('status', 'open')
      .gte('event_date', today)
      .order('event_date', { ascending: true })
      .limit(3);
    return data ?? [];
  } catch {
    return [];
  }
}

async function getWhatsApp(): Promise<string> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from('settings').select('value').eq('key', 'studio_info').single();
    return (data?.value as { whatsapp?: string })?.whatsapp ?? '';
  } catch {
    return '';
  }
}

const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
function formatDateShort(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return `${DAYS_HE[d.getDay()]}, ${d.toLocaleDateString('he-IL')}`;
}

async function getServices(): Promise<Service[]> {
  try {
    const supabase = createAdminClient();
    const { data: services } = await supabase
      .from('services')
      .select('*, packages(*)')
      .eq('is_active', true)
      .eq('is_deleted', false)
      .order('name');
    return (services ?? []).map(service => ({
      ...service,
      packages: (service.packages ?? []).filter((p: { is_active: boolean; is_deleted: boolean }) => p.is_active && !p.is_deleted),
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [services, upcomingEvents, whatsapp] = await Promise.all([
    getServices(),
    getUpcomingEvents(),
    getWhatsApp(),
  ]);

  return (
    <main className="min-h-screen bg-primary" dir="rtl">
      <ClientHeader />

      {/* Hero */}
      <section className="relative py-20 md:py-32 px-4 text-center overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto">
          <p className="text-accent text-xs font-bold uppercase tracking-[0.3em] mb-5">
            Bengo Productions · קריית שמונה
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-primary-text mb-6 leading-tight">
            אולפן הקלטות
            <br />
            <span className="text-accent">מקצועי</span>
          </h1>
          <p className="text-muted text-base md:text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            הקלט מוזיקה, פודקאסטים ותוכן שמע בסביבה מקצועית.
            ציוד מהשורה הראשונה, אקוסטיקה מושלמת.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/book"
              className="bg-accent hover:bg-accent/90 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-accent/20 hover:shadow-accent/30"
            >
              הזמן עכשיו
            </Link>
            <Link
              href="/events"
              className="border border-white/15 hover:border-white/30 text-primary-text px-8 py-3.5 rounded-xl transition-colors"
            >
              אירועים
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="py-16 px-4 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-end mb-8">
              <Link href="/events" className="text-sm text-accent hover:underline">
                כל האירועים ←
              </Link>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-primary-text">אירועים קרובים</h2>
                <p className="text-muted text-sm mt-1">ג&#39;אמים, סדנאות, הופעות ועוד</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {upcomingEvents.map(event => {
                const gradient = EVENT_TYPE_GRADIENTS[event.event_type] ?? EVENT_TYPE_GRADIENTS.other;
                const icon = EVENT_TYPE_ICONS[event.event_type] ?? '🎵';
                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="group bg-card border border-white/10 rounded-2xl overflow-hidden hover:border-white/25 transition-all hover:-translate-y-0.5"
                  >
                    <div className={`h-36 relative bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
                      {event.image_url ? (
                        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl opacity-60">{icon}</span>
                      )}
                      {event.status === 'full' && (
                        <span className="absolute top-3 left-3 text-xs px-2 py-0.5 rounded-full bg-black/60 text-accent font-medium">מלא</span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-primary-text text-right mb-1 line-clamp-1">{event.title}</p>
                      <p className="text-xs text-muted text-right mb-3">
                        {formatDateShort(event.event_date)} · {event.event_time?.slice(0, 5)}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted group-hover:text-accent transition-colors">פרטים ←</span>
                        <span className="text-accent text-sm font-semibold">
                          {event.price === 0 ? 'חינם' : `₪${event.price}`}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      <section id="services" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-primary-text mb-2">השירותים שלנו</h2>
            <p className="text-muted text-sm">הכל מאד-גבי עד פרודקשן מלא</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {services.length === 0
              ? ['הקלטות מוזיקה', 'פודקאסט', 'מיקסינג ומאסטרינג'].map(name => (
                  <div key={name} className="bg-card border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                      <span className="text-accent text-lg">🎵</span>
                    </div>
                    <h3 className="font-semibold text-primary-text mb-2">{name}</h3>
                    <p className="text-sm text-muted">שירות מקצועי באולפן</p>
                  </div>
                ))
              : services.map(service => (
                  <div key={service.id} className="bg-card border border-white/10 rounded-2xl p-6 hover:border-accent/30 transition-colors group">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                      <span className="text-accent text-lg">🎵</span>
                    </div>
                    <h3 className="font-semibold text-primary-text text-lg mb-2">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-muted mb-4 leading-relaxed">{service.description}</p>
                    )}
                    {service.packages && service.packages.length > 0 && (
                      <p className="text-accent text-sm font-semibold">
                        החל מ-₪{Math.min(...service.packages.map(p => p.price))}
                      </p>
                    )}
                  </div>
                ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/book"
              className="bg-accent hover:bg-accent/90 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-accent/20 inline-block"
            >
              הזמן אולפן
            </Link>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="py-12 px-4 border-t border-white/5">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { icon: '🎛️', title: 'ציוד מקצועי', desc: 'מיקרופונים ואביזרים מהשורה הראשונה' },
            { icon: '🔇', title: 'אקוסטיקה מושלמת', desc: 'חדר מטופל אקוסטית' },
            { icon: '⚡', title: 'הזמנה מהירה', desc: 'בחר שירות ושעה תוך דקות' },
          ].map(f => (
            <div key={f.title}>
              <div className="text-3xl mb-2">{f.icon}</div>
              <p className="font-semibold text-primary-text text-sm mb-1">{f.title}</p>
              <p className="text-xs text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 text-center">
        <p className="text-muted text-sm">
          © {new Date().getFullYear()} Bengo Productions · קריית שמונה
        </p>
      </footer>

      <WhatsAppButton phone={whatsapp} />
    </main>
  );
}
