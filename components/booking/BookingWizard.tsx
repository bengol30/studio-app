'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Service } from '@/types';
import Step1Service from './Step1Service';
import Step2Package from './Step2Package';
import Step3Details from './Step3Details';
import Step4Files from './Step4Files';
import Step5Confirm from './Step5Confirm';

export interface WizardState {
  step: 1 | 2 | 3 | 4 | 5;
  serviceId: string;
  packageId: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  answers: Record<string, string>;
  filesUrl: string;
  agreedToTerms: boolean;
}

const STEPS = ['שירות', 'חבילה ותאריך', 'פרטים', 'קבצים', 'אישור'];

export default function BookingWizard({ services }: { services: Service[] }) {
  const router = useRouter();
  const [state, setState] = useState<WizardState>({
    step: 1,
    serviceId: '',
    packageId: '',
    date: '',
    time: '',
    name: '',
    phone: '',
    answers: {},
    filesUrl: '',
    agreedToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchParams = useSearchParams();

  // Prefill from URL (Re-Book feature)
  useEffect(() => {
    const serviceId = searchParams.get('serviceId');
    const name = searchParams.get('name');
    const phone = searchParams.get('phone');

    if (serviceId || name || phone) {
      setState(prev => ({
        ...prev,
        serviceId: serviceId || prev.serviceId,
        name: name || prev.name,
        phone: phone || prev.phone,
      }));
    }
  }, [searchParams]);

  function update(patch: Partial<WizardState>) {
    setState(prev => ({ ...prev, ...patch }));
  }

  function next() {
    setState(prev => ({ ...prev, step: Math.min(5, prev.step + 1) as WizardState['step'] }));
  }

  function back() {
    setState(prev => ({ ...prev, step: Math.max(1, prev.step - 1) as WizardState['step'] }));
    setError('');
  }

  async function submit() {
    setLoading(true);
    setError('');

    const selectedService = services.find(s => s.id === state.serviceId);
    const selectedPackage = selectedService?.packages?.find(p => p.id === state.packageId);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: state.serviceId,
          package_id: state.packageId,
          booking_date: state.date,
          start_time: state.time,
          client_name: state.name,
          client_phone: state.phone,
          answers: state.answers,
          files_url: state.filesUrl || null,
          duration: selectedPackage?.duration_minutes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'אירעה שגיאה, נסה שוב');
        setLoading(false);
        return;
      }

      router.push(`/booking/success?token=${data.token}`);
    } catch {
      setError('אירעה שגיאה בשליחה, נסה שוב');
      setLoading(false);
    }
  }

  const selectedService = services.find(s => s.id === state.serviceId);

  return (
    <div className="bg-card rounded-2xl border border-white/10 overflow-hidden">
      {/* Step indicator */}
      <div className="flex border-b border-white/10">
        {STEPS.map((label, i) => {
          const stepNum = (i + 1) as WizardState['step'];
          const isActive = state.step === stepNum;
          const isDone = state.step > stepNum;
          return (
            <div
              key={label}
              className={`flex-1 py-3 text-center text-xs transition-colors ${isActive ? 'text-accent border-b-2 border-accent font-semibold' :
                  isDone ? 'text-green-400' : 'text-muted'
                }`}
            >
              {isDone ? '✓' : stepNum}. {label}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="p-6">
        {state.step === 1 && (
          <Step1Service services={services} state={state} update={update} onNext={next} />
        )}
        {state.step === 2 && (
          <Step2Package service={selectedService!} state={state} update={update} onNext={next} onBack={back} />
        )}
        {state.step === 3 && (
          <Step3Details service={selectedService!} state={state} update={update} onNext={next} onBack={back} />
        )}
        {state.step === 4 && (
          <Step4Files state={state} update={update} onNext={next} onBack={back} />
        )}
        {state.step === 5 && (
          <Step5Confirm
            services={services}
            state={state}
            loading={loading}
            error={error}
            onSubmit={submit}
            onBack={back}
          />
        )}
      </div>
    </div>
  );
}
