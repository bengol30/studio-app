import type { Metadata } from 'next';
import BookingWizard from '@/components/booking/BookingWizard';
import type { Service } from '@/types';
import { createAdminClient } from '@/lib/supabase-admin';

export const metadata: Metadata = {
  title: 'הזמנת סטודיו | Bengo Productions',
  description: 'הזמן את האולפן שלך עוד היום',
};

async function getServices(): Promise<Service[]> {
  try {
    const supabase = createAdminClient();
    const { data: services } = await supabase
      .from('services')
      .select('*, packages(*), service_fields(*)')
      .eq('is_active', true)
      .eq('is_deleted', false)
      .order('name');

    return (services ?? []).map(service => ({
      ...service,
      packages: (service.packages ?? [])
        .filter((p: { is_active: boolean; is_deleted: boolean }) => p.is_active && !p.is_deleted)
        .sort((a: { price: number }, b: { price: number }) => a.price - b.price),
      service_fields: (service.service_fields ?? [])
        .sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order),
    }));
  } catch {
    return [];
  }
}

export default async function BookPage() {
  const services = await getServices();

  return (
    <main className="min-h-screen bg-primary py-10 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-text mb-2">הזמנת אולפן</h1>
          <p className="text-muted">בחר שירות, תאריך ומלא את הפרטים</p>
        </div>
        <BookingWizard services={services} />
      </div>
    </main>
  );
}
