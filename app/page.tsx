import type { Metadata } from 'next';
import Link from 'next/link';
import type { Service } from '@/types';

export const metadata: Metadata = {
  title: 'Bengo Productions | אולפן הקלטות קריית שמונה',
  description: 'אולפן הקלטות מקצועי בקריית שמונה. הזמן סטודיו, הקלטת מוזיקה, פודקאסט ועוד.',
};

async function getServices(): Promise<Service[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/services`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const services = await getServices();

  return (
    <main className="min-h-screen bg-primary" dir="rtl">
      {/* Nav */}
      <header className="border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <Link href="/admin/login" className="text-xs text-muted hover:text-primary-text transition-colors">
          כניסת מנהל
        </Link>
        <span className="text-primary-text font-bold tracking-wide">Bengo Productions</span>
      </header>

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
              href="#services"
              className="border border-white/15 hover:border-white/30 text-primary-text px-8 py-3.5 rounded-xl transition-colors"
            >
              השירותים שלנו
            </Link>
          </div>
        </div>
      </section>

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
    </main>
  );
}
