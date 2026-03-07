'use client';

import type { Service } from '@/types';
import type { WizardState } from './BookingWizard';

interface Props {
  services: Service[];
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  onNext: () => void;
}

export default function Step1Service({ services, state, update, onNext }: Props) {
  function select(serviceId: string) {
    update({ serviceId, packageId: '', date: '', time: '' });
    onNext();
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12 text-muted">
        <p className="text-lg mb-2">אין שירותים זמינים כרגע</p>
        <p className="text-sm">אנא נסה שוב מאוחר יותר</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-primary-text mb-1">בחר שירות</h2>
      <p className="text-sm text-muted mb-6">באיזה שירות אתה מעוניין?</p>

      <div className="space-y-3">
        {services.map(service => (
          <button
            key={service.id}
            onClick={() => select(service.id)}
            className={`w-full text-right p-4 rounded-xl border transition-all ${
              state.serviceId === service.id
                ? 'border-accent bg-accent/10 text-primary-text'
                : 'border-white/10 bg-primary hover:border-white/30 text-primary-text'
            }`}
          >
            <div className="font-semibold text-base">{service.name}</div>
            {service.description && (
              <div className="text-sm text-muted mt-1">{service.description}</div>
            )}
            {service.packages && service.packages.length > 0 && (
              <div className="text-xs text-accent mt-2">
                החל מ-₪{Math.min(...service.packages.map(p => p.price))}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
