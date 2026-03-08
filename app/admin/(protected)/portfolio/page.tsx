import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-server';
import PortfolioEditor from './PortfolioEditor';

export const metadata: Metadata = { title: 'תיק עבודות | ניהול' };
export const dynamic = 'force-dynamic';

export interface PortfolioItem {
    id: string;
    title: string;
    type: string;
    year: string;
    emoji: string;
    color: string;
    image_mode?: 'upload' | 'youtube'; // which mode is active
    image_url?: string;                 // uploaded image URL
    youtube_url?: string;               // YouTube video URL (thumbnail extracted automatically)
}

export interface PortfolioSettings {
    studio_title: string;
    studio_description: string;
    studio_about: string;
    items: PortfolioItem[];
}

const DEFAULT_SETTINGS: PortfolioSettings = {
    studio_title: 'Bengo Productions',
    studio_description: 'אולפן הקלטות מקצועי בקריית שמונה – הפקות מוזיקה, הקלטות, מיקס ומאסטרינג',
    studio_about: 'Bengo Productions הוא אולפן הקלטות ייחודי בצפון הארץ, עם ניסיון של שנים בהפקת מוזיקה איכותית לאמנים עצמאיים, להקות ובעלי עסקים.',
    items: [
        { id: '1', title: 'הקלטת אלבום – רותם כהן', type: 'אלבום', year: '2025', emoji: '🎵', color: 'from-purple-900/60 to-pink-900/40' },
        { id: '2', title: 'פודקאסט "עולם המוזיקה"', type: 'פודקאסט', year: '2025', emoji: '🎙️', color: 'from-blue-900/60 to-cyan-900/40' },
        { id: '3', title: "ג'אם סשן חודשי", type: 'אירוע חי', year: '2025', emoji: '🎸', color: 'from-orange-900/60 to-red-900/40' },
    ],
};

const COLORS = [
    { label: 'סגול-ורוד', value: 'from-purple-900/60 to-pink-900/40' },
    { label: 'כחול-ציאן', value: 'from-blue-900/60 to-cyan-900/40' },
    { label: 'כתום-אדום', value: 'from-orange-900/60 to-red-900/40' },
    { label: 'ירוק-טיל', value: 'from-emerald-900/60 to-teal-900/40' },
    { label: 'אפור-כהה', value: 'from-gray-800/60 to-slate-900/40' },
    { label: 'אדום (accent)', value: 'from-accent/30 to-accent/10' },
];

async function getPortfolioSettings(): Promise<PortfolioSettings> {
    const supabase = createAdminClient();
    const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'portfolio')
        .single();
    if (!data?.value) return DEFAULT_SETTINGS;
    return data.value as PortfolioSettings;
}

async function savePortfolioSettings(formData: FormData) {
    'use server';
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) redirect('/admin/login');

    const supabase = createAdminClient();
    const raw = formData.get('portfolio_json') as string;
    let parsed: PortfolioSettings;
    try { parsed = JSON.parse(raw); } catch { return; }

    await supabase.from('settings').upsert({ key: 'portfolio', value: parsed });
    revalidatePath('/about');
    revalidatePath('/admin/portfolio');
}

export default async function PortfolioPage() {
    const settings = await getPortfolioSettings();

    return (
        <div className="p-6" dir="rtl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-primary-text">תיק עבודות</h1>
                <p className="text-muted text-sm mt-1">עריכת תוכן דף &quot;תיק עבודות&quot; הציבורי</p>
            </div>
            <PortfolioEditor
                initialSettings={settings}
                colors={COLORS}
                savePortfolioSettings={savePortfolioSettings}
            />
        </div>
    );
}
