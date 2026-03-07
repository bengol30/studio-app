'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  client_name: string;
  client_phone: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  services: { name: string } | null;
  packages: { name: string; duration_minutes: number } | null;
}

interface Props {
  bookings: Booking[];
  year: number;
  month: number;
  view: string;
}

const MONTH_NAMES_HE = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

const DAY_NAMES_SHORT = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

export default function CalendarClient({ bookings, year, month, view: initialView }: Props) {
  const router = useRouter();
  const [view, setView] = useState(initialView);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  function navigate(dir: 'prev' | 'next') {
    let newMonth = month + (dir === 'next' ? 1 : -1);
    let newYear = year;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    router.push(`/admin/calendar?year=${newYear}&month=${newMonth}&view=${view}`);
  }

  const bookingsByDate = bookings.reduce<Record<string, Booking[]>>((acc, b) => {
    if (!acc[b.booking_date]) acc[b.booking_date] = [];
    acc[b.booking_date].push(b);
    return acc;
  }, {});

  // Build month grid
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-card border border-white/10 rounded-xl p-1">
          {(['month', 'list'] as const).map(v => (
            <button
              key={v}
              onClick={() => { setView(v); router.push(`/admin/calendar?year=${year}&month=${month}&view=${v}`); }}
              className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${view === v ? 'bg-accent/20 text-accent font-medium' : 'text-muted hover:text-primary-text'}`}
            >
              {v === 'month' ? 'חודשי' : 'רשימה'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('next')} className="text-muted hover:text-primary-text p-1">›</button>
          <h2 className="text-lg font-semibold text-primary-text min-w-36 text-center">
            {MONTH_NAMES_HE[month - 1]} {year}
          </h2>
          <button onClick={() => navigate('prev')} className="text-muted hover:text-primary-text p-1">‹</button>
        </div>
      </div>

      {view === 'month' && (
        <div className="bg-card rounded-xl border border-white/10 overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-white/10">
            {DAY_NAMES_SHORT.map(d => (
              <div key={d} className="text-center text-xs text-muted py-2">{d}</div>
            ))}
          </div>
          {/* Days grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="border-b border-l border-white/5 min-h-20 p-1" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayBookings = bookingsByDate[dateStr] ?? [];
              const isToday = dateStr === todayStr;
              return (
                <div
                  key={day}
                  className={`border-b border-l border-white/5 min-h-20 p-1 ${isToday ? 'bg-accent/5' : ''}`}
                >
                  <span className={`text-xs font-medium ${isToday ? 'text-accent' : 'text-muted'}`}>{day}</span>
                  <div className="mt-1 space-y-0.5">
                    {dayBookings.slice(0, 3).map(b => (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBooking(b)}
                        className={`w-full text-right text-xs px-1 py-0.5 rounded truncate transition-colors ${
                          b.status === 'confirmed' ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' : 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                        }`}
                      >
                        {b.start_time} {b.client_name}
                      </button>
                    ))}
                    {dayBookings.length > 3 && (
                      <span className="text-xs text-muted px-1">+{dayBookings.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'list' && (
        <div className="space-y-2">
          {bookings.length === 0 ? (
            <div className="text-center py-16 text-muted">אין הזמנות בחודש זה</div>
          ) : (
            bookings.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBooking(b)}
                className="w-full bg-card border border-white/10 rounded-xl p-4 text-right hover:border-white/20 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${b.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {b.status === 'confirmed' ? 'מאושר' : 'ממתין'}
                  </span>
                  <div>
                    <p className="font-medium text-primary-text">{b.client_name}</p>
                    <p className="text-sm text-muted">{b.booking_date} · {b.start_time}–{b.end_time}</p>
                    <p className="text-sm text-muted">{b.services?.name} · {b.packages?.name}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-card border border-white/10 rounded-2xl p-6 max-w-sm w-full"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex justify-between items-start mb-4">
              <button onClick={() => setSelectedBooking(null)} className="text-muted hover:text-primary-text">✕</button>
              <h3 className="font-semibold text-primary-text">{selectedBooking.client_name}</h3>
            </div>
            <div className="space-y-2 text-sm">
              <Row label="שירות" value={selectedBooking.services?.name ?? ''} />
              <Row label="חבילה" value={selectedBooking.packages?.name ?? ''} />
              <Row label="תאריך" value={selectedBooking.booking_date} />
              <Row label="שעה" value={`${selectedBooking.start_time} – ${selectedBooking.end_time}`} />
              <Row label="טלפון" value={selectedBooking.client_phone} />
              <Row label="סטטוס" value={selectedBooking.status === 'confirmed' ? '✓ מאושר' : '⏳ ממתין'} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-primary-text">{value}</span>
      <span className="text-muted">{label}</span>
    </div>
  );
}
