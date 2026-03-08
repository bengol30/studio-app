import type { Metadata } from 'next';
import Link from 'next/link';
import ClientHeader from '@/components/ClientHeader';

export const metadata: Metadata = {
    title: 'אודות | Bengo Productions',
    description: 'אולפן הקלטות מקצועי בקריית שמונה – הפקות מוזיקה, הקלטות, מיקס ומאסטרינג',
};

const PRODUCTIONS = [
    {
        title: 'הקלטת אלבום – רותם כהן',
        type: 'אלבום',
        year: '2025',
        emoji: '🎵',
        color: 'from-purple-900/60 to-pink-900/40',
    },
    {
        title: 'פודקאסט "עולם המוזיקה"',
        type: 'פודקאסט',
        year: '2025',
        emoji: '🎙️',
        color: 'from-blue-900/60 to-cyan-900/40',
    },
    {
        title: 'ג\'אם סשן חודשי',
        type: 'אירוע חי',
        year: '2025',
        emoji: '🎸',
        color: 'from-orange-900/60 to-red-900/40',
    },
    {
        title: 'הפקת סינגל – דנה לוי',
        type: 'סינגל',
        year: '2024',
        emoji: '🎤',
        color: 'from-emerald-900/60 to-teal-900/40',
    },
    {
        title: 'סדנת הפקה מוזיקלית',
        type: 'סדנה',
        year: '2024',
        emoji: '🎛️',
        color: 'from-accent/30 to-accent/10',
    },
    {
        title: 'הקלטות ריאיונות רדיו',
        type: 'רדיו',
        year: '2024',
        emoji: '📻',
        color: 'from-gray-800/60 to-slate-900/40',
    },
];

const SERVICES_GALLERY = [
    { icon: '🎚️', title: 'מיקס ומאסטרינג', desc: 'עיבוד מקצועי לכל סוגי המוזיקה' },
    { icon: '🎵', title: 'הקלטות שיר', desc: 'אולפן דיגיטלי מצוייד ברמה הגבוהה ביותר' },
    { icon: '🎙️', title: 'הקלטות דיבור', desc: 'פודקאסטים, ריאיונות, ספרי אודיו' },
    { icon: '🎸', title: 'ג\'אמים ואירועים', desc: 'מפגשים מוזיקליים וכיתות אמן' },
];

export default function AboutPage() {
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
                    <h1 className="text-4xl font-bold text-primary-text mb-4">
                        Bengo Productions
                    </h1>
                    <p className="text-xl text-muted leading-relaxed">
                        אולפן הקלטות מקצועי בקריית שמונה, מציע שירותי הקלטה, מיקס, מאסטרינג, הפקה מוזיקלית ואירועים מוזיקליים.
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 pb-16 space-y-16">

                {/* About section */}
                <section>
                    <div className="bg-card rounded-2xl border border-white/10 p-8">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div className="text-right">
                                <h2 className="text-2xl font-bold text-primary-text mb-4">מי אנחנו</h2>
                                <p className="text-muted leading-relaxed mb-4">
                                    Bengo Productions הוא אולפן הקלטות ייחודי בצפון הארץ, עם ניסיון של שנים בהפקת מוזיקה איכותית לאמנים עצמאיים, להקות ובעלי עסקים.
                                </p>
                                <p className="text-muted leading-relaxed">
                                    המקום שלנו עוצב במיוחד ליצירתיות – בין אם אתם מקליטים את השיר הראשון שלכם, מפיקים פודקאסט מקצועי, או מחפשים סביבה מוזיקלית פעילה.
                                </p>
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
                <section>
                    <h2 className="text-xl font-bold text-primary-text mb-6 text-right">הפקות בולטות</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {PRODUCTIONS.map((prod) => (
                            <div
                                key={prod.title}
                                className={`relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br ${prod.color} h-40 flex flex-col justify-end p-4 hover:border-white/20 transition-colors`}
                            >
                                <div className="absolute top-4 left-4">
                                    <span className="text-3xl opacity-40">{prod.emoji}</span>
                                </div>
                                <div className="absolute top-3 right-3">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-black/30 text-white/70 backdrop-blur-sm">
                                        {prod.type}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-white leading-tight">{prod.title}</p>
                                    <p className="text-xs text-white/50 mt-0.5">{prod.year}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

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
