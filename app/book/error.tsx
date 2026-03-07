'use client';

import Link from 'next/link';

export default function Error() {
  return (
    <main className="min-h-screen bg-primary flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <p className="text-4xl mb-4">⚠️</p>
        <p className="text-primary-text font-semibold mb-2">שגיאה בטעינת דף ההזמנות</p>
        <Link href="/" className="text-accent text-sm hover:underline">חזור לדף הבית</Link>
      </div>
    </main>
  );
}
