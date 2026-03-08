import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-server';
import type { OpeningHours } from '@/types';

export const metadata: Metadata = {
  title: 'הגדרות | ניהול',
};

export const dynamic = 'force-dynamic';

const DAYS = [
  { key: 'sunday', label: 'ראשון' },
  { key: 'monday', label: 'שני' },
  { key: 'tuesday', label: 'שלישי' },
  { key: 'wednesday', label: 'רביעי' },
  { key: 'thursday', label: 'חמישי' },
  { key: 'friday', label: 'שישי' },
  { key: 'saturday', label: 'שבת' },
] as const;

async function getSettings() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['opening_hours', 'buffer_minutes', 'cancellation_hours', 'terms_of_service', 'studio_info']);

  const map: Record<string, unknown> = {};
  (data ?? []).forEach(row => { map[row.key] = row.value; });
  return map;
}

async function saveSettings(formData: FormData) {
  'use server';
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect('/admin/login');

  const supabase = createAdminClient();

  // Opening hours
  const openingHours: Record<string, unknown> = {};
  for (const day of DAYS) {
    openingHours[day.key] = {
      active: formData.get(`${day.key}_active`) === 'on',
      open: formData.get(`${day.key}_open`) as string,
      close: formData.get(`${day.key}_close`) as string,
    };
  }

  await supabase.from('settings').upsert({ key: 'opening_hours', value: openingHours });
  await supabase.from('settings').upsert({
    key: 'buffer_minutes',
    value: parseInt(formData.get('buffer_minutes') as string) || 10,
  });
  await supabase.from('settings').upsert({
    key: 'cancellation_hours',
    value: parseInt(formData.get('cancellation_hours') as string) || 48,
  });
  await supabase.from('settings').upsert({
    key: 'terms_of_service',
    value: formData.get('terms_of_service') as string,
  });

  revalidatePath('/admin/settings');
}

export default async function SettingsPage() {
  const settings = await getSettings();
  const hours = (settings.opening_hours ?? {}) as OpeningHours;
  const bufferMinutes = (settings.buffer_minutes as number) ?? 10;
  const cancellationHours = (settings.cancellation_hours as number) ?? 48;
  const terms = (settings.terms_of_service as string) ?? '';

  return (
    <div className="p-6 max-w-2xl" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-text">הגדרות</h1>
        <p className="text-muted text-sm mt-1">שעות פתיחה, חיץ בין הזמנות ותנאים</p>
      </div>

      <form action={saveSettings} className="space-y-6">
        {/* Opening hours */}
        <div className="bg-card rounded-xl border border-white/10 p-5">
          <h2 className="font-semibold text-primary-text mb-4">שעות פתיחה</h2>
          <div className="space-y-3">
            {DAYS.map(({ key, label }) => {
              const day = hours[key as keyof OpeningHours];
              return (
                <div key={key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name={`${key}_active`}
                    defaultChecked={day?.active ?? false}
                    className="accent-accent w-4 h-4"
                  />
                  <span className="text-primary-text w-16 text-sm">{label}</span>
                  <input
                    type="time"
                    name={`${key}_open`}
                    defaultValue={day?.open ?? '09:00'}
                    className="bg-primary border border-white/10 rounded-lg px-3 py-1.5 text-primary-text text-sm focus:outline-none focus:border-accent"
                  />
                  <span className="text-muted text-sm">עד</span>
                  <input
                    type="time"
                    name={`${key}_close`}
                    defaultValue={day?.close ?? '22:00'}
                    className="bg-primary border border-white/10 rounded-lg px-3 py-1.5 text-primary-text text-sm focus:outline-none focus:border-accent"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Buffer + cancellation */}
        <div className="bg-card rounded-xl border border-white/10 p-5">
          <h2 className="font-semibold text-primary-text mb-4">הגדרות הזמנות</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm text-primary-text">חיץ בין הזמנות (דקות)</label>
                <p className="text-xs text-muted">זמן ניקוי בין לקוחות</p>
              </div>
              <input
                type="number"
                name="buffer_minutes"
                defaultValue={bufferMinutes}
                min={0}
                max={60}
                className="bg-primary border border-white/10 rounded-lg px-3 py-1.5 text-primary-text w-20 text-center focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm text-primary-text">חלון ביטול (שעות)</label>
                <p className="text-xs text-muted">מינימום שעות לפני ביטול</p>
              </div>
              <input
                type="number"
                name="cancellation_hours"
                defaultValue={cancellationHours}
                min={0}
                max={168}
                className="bg-primary border border-white/10 rounded-lg px-3 py-1.5 text-primary-text w-20 text-center focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-card rounded-xl border border-white/10 p-5">
          <h2 className="font-semibold text-primary-text mb-3">תנאי שימוש</h2>
          <textarea
            name="terms_of_service"
            defaultValue={terms}
            rows={6}
            className="w-full bg-primary border border-white/10 rounded-lg px-4 py-3 text-primary-text text-sm focus:outline-none focus:border-accent resize-none"
            placeholder="הכנס תנאי שימוש..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          שמור הגדרות
        </button>
      </form>
    </div>
  );
}
