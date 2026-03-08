import type { Metadata } from 'next';
import Link from 'next/link';
import ClientHeader from '@/components/ClientHeader';
import { createAdminClient } from '@/lib/supabase-admin';
import type { PortfolioSettings, PortfolioItem } from '@/app/admin/(protected)/portfolio/page';

export const dynamic = 'force-dynamic';

const DEFAULT_SETTINGS: PortfolioSettings = {
    studio_title: 'Bengo Productions',
    studio_description: 'אולפן הקלטות מקצועי בקריית שמונה – הפקות מוזיקה, הקלטות, מיקס ומאסטרינג',
    studio_about: 'Bengo Productions הוא אולפן הקלטות ייחודי בצפון הארץ, עם ניסיון של שנים בהפקת מוזיקה איכותית לאמנים עצמאיים, להקות ובעלי עסקים.',
    items: [],
};

async function getPortfolioSettings(): Promise<PortfolioSettings> {
    try {
        const supabase = createAdminClient();
        const { data } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'portfolio')
            .single();
        if (!data?.value) return DEFAULT_SETTINGS;
        return data.value as PortfolioSettings;
    } catch {
        return DEFAULT_SETTINGS;
    }
}

export async function generateMetadata(): Promise<Metadata> {
    const s = await getPortfolioSettings();
    return {
        title: `${s.studio_title} | אודות`,
        description: s.studio_description,
    };
}

const SERVICES_GALLERY = [
    { icon: '🎚️', title: 'מיקס ומאסטרינג', desc: 'עיבוד מקצועי לכל סוגי המוזיקה' },
    { icon: '🎵', title: 'הקלטות שיר', desc: 'אולפן דיגיטלי מצוייד ברמה הגבוהה ביותר' },
    { icon: '🎙️', title: 'הקלטות דיבור', desc: 'פודקאסטים, ריאיונות, ספרי אודיו' },
    { icon: '🎸', title: "ג'אמים ואירועים", desc: 'מפגשים מוזיקליים וכיתות אמן' },
];

export default async function AboutPage() {
    const settings = await getPortfolioSettings();

    return (
        <main className="min-h-screen bg-primary" dir="rtl">
            <ClientHeader />

            {/* Hero */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
                <div className="max-w-3xl mx-auto px-4 py-16 relative z-10 text-right">
                    <Link href="/" className="text-muted text-sm hover:text-primary-text transition-colors mb-8 inline-block">
                        ← דף הבית
                    </Link>
                    <h1 className="text-4xl font-bold text-primary-text mb-4">{settings.studio_title}</h1>
                    <p className="text-xl text-muted leading-relaxed">{settings.studio_description}</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 pb-16 space-y-16">

                {/* About section */}
                <section>
                    <div className="bg-card rounded-2xl border border-white/10 p-8">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div className="text-right">
                                <h2 className="text-2xl font-bold text-primary-text mb-4">מי אנחנו</h2>
                                <p className="text-muted leading-relaxed">{settings.studio_about}</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                {SERVICES_GALLERY.map((s) => (
                                    <div key={s.title} className="flex items-center gap-4 bg-primary rounded-xl p-4">
                                        <span className="text-3xl">{s.icon}</span>
                                        <div className="text-right">
                                            <p className="font-semibold text-primary-text text-sm">{s.title}</p>
                                            <p className="text-xs text-muted">{s.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Portfolio gallery */}
                {settings.items.length > 0 && (
                    <section>
                        <h2 className="text-xl font-bold text-primary-text mb-6 text-right">הפקות בולטות</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {settings.items.map((item: PortfolioItem) => (
                                <div
                                    key={item.id}
                                    className={`relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br ${item.color} h-40 flex flex-col justify-end p-4 hover:border-white/20 transition-colors`}
                                >
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute top-4 left-4">
                                            <span className="text-3xl opacity-40">{item.emoji}</span>
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-black/30 text-white/70 backdrop-blur-sm">
                                            {item.type}
                                        </span>
                                    </div>
                                    <div className="text-right relative z-10">
                                        <p className="text-sm font-semibold text-white leading-tight drop-shadow">{item.title}</p>
                                        <p className="text-xs text-white/50 mt-0.5">{item.year}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* CTA */}
                <section className="text-center">
                    <div className="bg-card rounded-2xl border border-accent/20 p-8">
                        <p className="text-2xl mb-3">🎵</p>
                        <h2 className="text-xl font-bold text-primary-text mb-2">מוכנים להתחיל?</h2>
                        <p className="text-muted text-sm mb-6">קבעו תור לאולפן – פשוט, מהיר, ומקצועי</p>
                        <Link
                            href="/book"
                            className="inline-block bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
                        >
                            הזמן תור עכשיו
                        </Link>
                    </div>
                </section>
            </div>

            <footer className="border-t border-white/5 py-8 px-4 text-center">
                <p className="text-muted text-sm">
                    © {new Date().getFullYear()} Bengo Productions · קריית שמונה
                </p>
            </footer>
        </main>
    );
}
