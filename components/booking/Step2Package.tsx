'use client';

import { useState, useEffect } from 'react';
import type { Service } from '@/types';
import type { WizardState } from './BookingWizard';

interface Props {
  service: Service;
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2Package({ service, state, update, onNext, onBack }: Props) {
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [joiningWaitlist, setJoiningWaitlist] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [waitlistError, setWaitlistError] = useState('');

  const selectedPackage = service.packages?.find(p => p.id === state.packageId);

  useEffect(() => {
    if (!state.packageId || !state.date) {
      setSlots([]);
      setWaitlistSuccess(false);
      setWaitlistError('');
      return;
    }
    setWaitlistSuccess(false);
    setWaitlistError('');
    setLoadingSlots(true);
    fetch(
      `/api/availability?service_id=${state.serviceId}&date=${state.date}&duration=${selectedPackage?.duration_minutes ?? 60}`
    )
      .then(r => r.json())
      .then(data => {
        setSlots(data.available_slots ?? []);
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [state.packageId, state.date, state.serviceId, selectedPackage?.duration_minutes]);

  const canProceed = state.packageId && state.date && state.time;

  const handleJoinWaitlist = async () => {
    if (!state.name || !state.phone) {
      setWaitlistError('אנא חזור לשלב הקודם (פרטים) וודא שהזנת שם וטלפון, או הזן אותם כעת.');
      // Optionally we could show inputs right here if they are missing
      // But in this flow name/phone comes in Step 3 typically. Wait, Re-Book pre-fills it.
      // If they haven't been to step 3, we should let them enter it.
      return;
    }

    setJoiningWaitlist(true);
    setWaitlistError('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: state.serviceId,
          client_name: state.name || 'לקוח ללא שם',
          client_phone: state.phone || 'ללא טלפון',
          requested_date: state.date,
        }),
      });
      if (res.ok) {
        setWaitlistSuccess(true);
      } else {
        const data = await res.json();
        setWaitlistError(data.error || 'שגיאה בהצטרפות לרשימת ההמתנה');
      }
    } catch {
      setWaitlistError('שגיאת שרת');
    } finally {
      setJoiningWaitlist(false);
    }
  };

  // Min date = today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <h2 className="text-xl font-semibold text-primary-text mb-1">בחר חבילה ותאריך</h2>
      <p className="text-sm text-muted mb-6">שירות: <span className="text-primary-text">{service.name}</span></p>

      {/* Packages */}
      <div className="mb-6">
        <p className="text-sm text-muted mb-3">חבילות:</p>
        <div className="space-y-2">
          {(service.packages ?? []).map(pkg => (
            <button
              key={pkg.id}
              onClick={() => update({ packageId: pkg.id, time: '' })}
              className={`w-full text-right p-4 rounded-xl border transition-all ${state.packageId === pkg.id
                  ? 'border-accent bg-accent/10'
                  : 'border-white/10 bg-primary hover:border-white/30'
                }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-accent font-bold">₪{pkg.price}</span>
                <div>
                  <span className="font-semibold text-primary-text">{pkg.name}</span>
                  <span className="text-muted text-sm mr-2">· {pkg.duration_minutes} דקות</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Date picker */}
      {state.packageId && (
        <div className="mb-6">
          <label className="block text-sm text-muted mb-2">תאריך:</label>
          <input
            type="date"
            min={today}
            value={state.date}
            onChange={e => update({ date: e.target.value, time: '' })}
            className="w-full bg-primary border border-white/10 rounded-lg px-4 py-2.5 text-primary-text focus:outline-none focus:border-accent"
            dir="ltr"
          />
        </div>
      )}

      {/* Time slots */}
      {state.date && (
        <div className="mb-6">
          <label className="block text-sm text-muted mb-2">שעות פנויות:</label>
          {loadingSlots ? (
            <p className="text-muted text-sm">טוען שעות...</p>
          ) : slots.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-accent text-sm mb-3">אין שעות פנויות בתאריך זה</p>

              {!waitlistSuccess ? (
                <div className="space-y-3">
                  <p className="text-sm text-primary-text">רוצה שנודיע לך אם מתפנה תור?</p>

                  {(!state.name || !state.phone) && (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="שם מלא"
                        value={state.name}
                        onChange={e => update({ name: e.target.value })}
                        className="bg-primary border border-white/10 rounded-lg px-3 py-2 text-sm text-primary-text focus:border-white/30 outline-none"
                      />
                      <input
                        type="tel"
                        placeholder="טלפון"
                        value={state.phone}
                        onChange={e => update({ phone: e.target.value })}
                        className="bg-primary border border-white/10 rounded-lg px-3 py-2 text-sm text-primary-text focus:border-white/30 outline-none"
                        dir="ltr"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleJoinWaitlist}
                    disabled={joiningWaitlist || !state.name || !state.phone}
                    className="w-full bg-white/10 hover:bg-white/15 text-primary-text text-sm font-medium py-2 rounded-lg transition-colors flex justify-center items-center disabled:opacity-50"
                  >
                    {joiningWaitlist ? 'רושם...' : 'הכנס אותי לרשימת המתנה'}
                  </button>
                  {waitlistError && <p className="text-accent text-xs mt-1">{waitlistError}</p>}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  נהדר! נעדכן אותך אם יתפנה מקום.
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map(slot => (
                <button
                  key={slot}
                  onClick={() => update({ time: slot })}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${state.time === slot
                      ? 'bg-accent text-white'
                      : 'bg-primary border border-white/10 text-primary-text hover:border-accent'
                    }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 justify-between mt-6">
        <button onClick={onBack} className="px-5 py-2.5 rounded-lg border border-white/10 text-muted hover:text-primary-text transition-colors">
          חזור
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="px-5 py-2.5 rounded-lg bg-accent text-white font-medium disabled:opacity-40 hover:bg-accent/90 transition-colors"
        >
          המשך
        </button>
      </div>
    </div>
  );
}
