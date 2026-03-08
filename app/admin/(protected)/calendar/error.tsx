'use client';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="p-6 flex items-center justify-center min-h-64" dir="rtl">
      <div className="text-center">
        <p className="text-4xl mb-3">⚠️</p>
        <p className="text-primary-text font-semibold mb-2">שגיאה בטעינת היומן</p>
        <button onClick={reset} className="text-accent text-sm hover:underline">נסה שוב</button>
      </div>
    </div>
  );
}
