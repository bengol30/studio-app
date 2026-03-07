import type { Metadata } from 'next';
import BookingWizard from '@/components/booking/BookingWizard';
import type { Service } from '@/types';

export const metadata: Metadata = {
  title: 'הזמנת סטודיו | Bengo Productions',
  description: 'הזמן את האולפן שלך עוד היום',
};

async function getServices(): Promise<Service[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/services`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
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
