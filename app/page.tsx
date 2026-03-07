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
      {/* Hero */}
      <section className="relative py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">
            Bengo Productions
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-primary-text mb-6 leading-tight">
            אולפן הקלטות מקצועי
            <br />
            <span className="text-accent">בקריית שמונה</span>
          </h1>
          <p className="text-muted text-lg mb-8 max-w-xl mx-auto">
            הקלט מוזיקה, פודקאסטים ותוכן שמע בסביבה מקצועית. ציוד מהשורה הראשונה, אקוסטיקה מושלמת.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/book"
              className="bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              הזמן עכשיו
            </Link>
            <Link
              href="#services"
              className="border border-white/20 hover:border-white/40 text-primary-text px-8 py-3 rounded-xl transition-colors"
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
            <p className="text-muted">הכל מאד-גבי עד פרודקשן מלא</p>
          </div>

          {services.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['הקלטות מוזיקה', 'פודקאסט', 'מיקסינג ומאסטרינג'].map(name => (
                <div key={name} className="bg-card rounded-xl border border-white/10 p-6">
                  <h3 className="font-semibold text-primary-text mb-2">{name}</h3>
                  <p className="text-sm text-muted">שירות מקצועי באולפן</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {services.map(service => (
                <div key={service.id} className="bg-card rounded-xl border border-white/10 p-6">
                  <h3 className="font-semibold text-primary-text text-lg mb-2">{service.name}</h3>
                  {service.description && (
                    <p className="text-sm text-muted mb-4">{service.description}</p>
                  )}
                  {service.packages && service.packages.length > 0 && (
                    <p className="text-accent text-sm font-medium">
                      החל מ-₪{Math.min(...service.packages.map(p => p.price))}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              href="/book"
              className="bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-3 rounded-xl transition-colors inline-block"
            >
              הזמן אולפן
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4 text-center">
        <p className="text-muted text-sm">
          © {new Date().getFullYear()} Bengo Productions · קריית שמונה
        </p>
      </footer>
    </main>
  );
}
