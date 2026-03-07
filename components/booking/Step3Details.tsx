'use client';

import type { Service } from '@/types';
import type { WizardState } from './BookingWizard';

interface Props {
  service: Service;
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step3Details({ service, state, update, onNext, onBack }: Props) {
  const fields = service.fields ?? [];

  function setAnswer(fieldId: string, value: string) {
    update({ answers: { ...state.answers, [fieldId]: value } });
  }

  const requiredFields = fields.filter(f => f.is_required);
  const canProceed =
    state.name.trim().length >= 2 &&
    state.phone.trim().length >= 7 &&
    requiredFields.every(f => state.answers[f.id]?.trim());

  return (
    <div>
      <h2 className="text-xl font-semibold text-primary-text mb-1">פרטים אישיים</h2>
      <p className="text-sm text-muted mb-6">מלא את הפרטים שלך</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-muted mb-1">שם מלא *</label>
          <input
            type="text"
            value={state.name}
            onChange={e => update({ name: e.target.value })}
            placeholder="ישראל ישראלי"
            className="w-full bg-primary border border-white/10 rounded-lg px-4 py-2.5 text-primary-text placeholder:text-muted focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">טלפון *</label>
          <input
            type="tel"
            value={state.phone}
            onChange={e => update({ phone: e.target.value })}
            placeholder="050-0000000"
            className="w-full bg-primary border border-white/10 rounded-lg px-4 py-2.5 text-primary-text placeholder:text-muted focus:outline-none focus:border-accent"
            dir="ltr"
          />
        </div>

        {/* Dynamic fields */}
        {fields.map(field => (
          <div key={field.id}>
            <label className="block text-sm text-muted mb-1">
              {field.label} {field.is_required && '*'}
            </label>
            {field.field_type === 'textarea' ? (
              <textarea
                value={state.answers[field.id] ?? ''}
                onChange={e => setAnswer(field.id, e.target.value)}
                rows={3}
                className="w-full bg-primary border border-white/10 rounded-lg px-4 py-2.5 text-primary-text placeholder:text-muted focus:outline-none focus:border-accent resize-none"
              />
            ) : field.field_type === 'select' ? (
              <select
                value={state.answers[field.id] ?? ''}
                onChange={e => setAnswer(field.id, e.target.value)}
                className="w-full bg-primary border border-white/10 rounded-lg px-4 py-2.5 text-primary-text focus:outline-none focus:border-accent"
              >
                <option value="">בחר...</option>
                {(field.options ?? []).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : field.field_type === 'checkbox' ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.answers[field.id] === 'true'}
                  onChange={e => setAnswer(field.id, e.target.checked ? 'true' : 'false')}
                  className="accent-accent w-4 h-4"
                />
                <span className="text-sm text-primary-text">{field.label}</span>
              </label>
            ) : (
              <input
                type="text"
                value={state.answers[field.id] ?? ''}
                onChange={e => setAnswer(field.id, e.target.value)}
                className="w-full bg-primary border border-white/10 rounded-lg px-4 py-2.5 text-primary-text placeholder:text-muted focus:outline-none focus:border-accent"
              />
            )}
          </div>
        ))}
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
          המשך
        </button>
      </div>
    </div>
  );
}
