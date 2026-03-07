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

  const selectedPackage = service.packages?.find(p => p.id === state.packageId);

  useEffect(() => {
    if (!state.packageId || !state.date) {
      setSlots([]);
      return;
    }
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
              className={`w-full text-right p-4 rounded-xl border transition-all ${
                state.packageId === pkg.id
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
            <p className="text-accent text-sm">אין שעות פנויות בתאריך זה</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map(slot => (
                <button
                  key={slot}
                  onClick={() => update({ time: slot })}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    state.time === slot
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
