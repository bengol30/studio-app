'use client';

import { useState } from 'react';
import type { WizardState } from './BookingWizard';

interface Props {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step4Files({ state, update, onNext, onBack }: Props) {
  const [urlError, setUrlError] = useState('');

  function validateUrl(val: string) {
    if (!val) {
      setUrlError('');
      return;
    }
    try {
      new URL(val);
      setUrlError('');
    } catch {
      setUrlError('כתובת URL לא תקינה');
    }
  }

  const canProceed = state.agreedToTerms && !urlError;

  return (
    <div>
      <h2 className="text-xl font-semibold text-primary-text mb-1">קבצים ותנאים</h2>
      <p className="text-sm text-muted mb-6">שתף קבצים רלוונטיים ואשר תנאי שימוש</p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm text-muted mb-1">
            קישור לקבצים (Google Drive / Dropbox / WeTransfer)
            <span className="text-muted mr-1">– אופציונלי</span>
          </label>
          <input
            type="url"
            value={state.filesUrl}
            onChange={e => {
              update({ filesUrl: e.target.value });
              validateUrl(e.target.value);
            }}
            placeholder="https://drive.google.com/..."
            className="w-full bg-primary border border-white/10 rounded-lg px-4 py-2.5 text-primary-text placeholder:text-muted focus:outline-none focus:border-accent"
            dir="ltr"
          />
          {urlError && <p className="text-accent text-sm mt-1">{urlError}</p>}
          <p className="text-xs text-muted mt-1">
            ניתן לשתף קבצי אודיו, תמונות, או כל חומר רלוונטי להזמנה
          </p>
        </div>

        <div className="bg-primary rounded-xl border border-white/10 p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={state.agreedToTerms}
              onChange={e => update({ agreedToTerms: e.target.checked })}
              className="accent-accent w-4 h-4 mt-0.5 flex-shrink-0"
            />
            <span className="text-sm text-primary-text">
              אני מאשר/ת את{' '}
              <span className="text-accent underline cursor-pointer">תנאי השימוש</span>
              {' '}של האולפן, כולל מדיניות הביטולים
            </span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 justify-between mt-6">
        <button onClick={onBack} className="px-5 py-2.5 rounded-lg border border-white/10 text-muted hover:text-primary-text transition-colors">
          חזור
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="px-5 py-2.5 rounded-lg bg-accent text-white font-medium disabled:opacity-40 hover:bg-accent/90 transition-colors"
        >
          המשך לאישור
        </button>
      </div>
    </div>
  );
}
