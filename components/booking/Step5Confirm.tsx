'use client';

import type { Service } from '@/types';
import type { WizardState } from './BookingWizard';

interface Props {
  services: Service[];
  state: WizardState;
  loading: boolean;
  error: string;
  onSubmit: () => void;
  onBack: () => void;
}

const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(`${dateStr}T00:00:00`);
  const day = DAYS_HE[d.getDay()];
  return `${day}, ${d.toLocaleDateString('he-IL')}`;
}

export default function Step5Confirm({ services, state, loading, error, onSubmit, onBack }: Props) {
  const service = services.find(s => s.id === state.serviceId);
  const pkg = service?.packages?.find(p => p.id === state.packageId);

  return (
    <div>
      <h2 className="text-xl font-semibold text-primary-text mb-1">סיכום הזמנה</h2>
      <p className="text-sm text-muted mb-6">בדוק את הפרטים לפני שליחה</p>

      <div className="bg-primary rounded-xl border border-white/10 divide-y divide-white/10 mb-6">
        <Row label="שירות" value={service?.name ?? ''} />
        <Row label="חבילה" value={pkg ? `${pkg.name} · ${pkg.duration_minutes} דקות` : ''} />
        <Row label="מחיר" value={pkg ? `₪${pkg.price}` : ''} />
        <Row label="תאריך" value={formatDate(state.date)} />
        <Row label="שעה" value={state.time} />
        <Row label="שם" value={state.name} />
        <Row label="טלפון" value={state.phone} />
        {state.filesUrl && <Row label="קבצים" value="✓ קישור מצורף" />}

        {Object.keys(state.answers).length > 0 &&
          service?.fields?.map(field => {
            const val = state.answers[field.id];
            if (!val) return null;
            const display = val === 'true' ? 'כן' : val === 'false' ? 'לא' : val;
            return <Row key={field.id} label={field.label} value={display} />;
          })}
      </div>

      {error && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 mb-4">
          <p className="text-accent text-sm">{error}</p>
        </div>
      )}

      <p className="text-xs text-muted mb-4 text-center">
        לאחר השליחה ההזמנה תהיה בסטטוס <strong className="text-yellow-400">ממתין לאישור</strong> עד שנאשר אותה
      </p>

      <div className="flex gap-3 justify-between">
        <button
          onClick={onBack}
          disabled={loading}
          className="px-5 py-2.5 rounded-lg border border-white/10 text-muted hover:text-primary-text transition-colors disabled:opacity-40"
        >
          חזור
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="px-6 py-2.5 rounded-lg bg-accent text-white font-medium disabled:opacity-60 hover:bg-accent/90 transition-colors"
        >
          {loading ? 'שולח...' : 'שלח הזמנה'}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center px-4 py-3">
      <span className="text-primary-text">{value}</span>
      <span className="text-muted text-sm">{label}</span>
    </div>
  );
}
