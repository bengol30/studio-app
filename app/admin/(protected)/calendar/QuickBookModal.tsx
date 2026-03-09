'use client';

import { useState } from 'react';
import type { Service } from '@/types';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
    services: Service[];
    initialDate?: string;
    initialTime?: string;
}

export default function QuickBookModal({ onClose, onSuccess, services, initialDate, initialTime }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [serviceId, setServiceId] = useState('');
    const [packageId, setPackageId] = useState('');
    const [date, setDate] = useState(initialDate || '');
    const [time, setTime] = useState(initialTime || '');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const selectedService = services.find(s => s.id === serviceId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!serviceId || !packageId || !date || !time || !name || !phone) {
            setError('אנא מלא את כל השדות');
            return;
        }

        setLoading(true);
        setError('');

        const duration = selectedService?.packages?.find(p => p.id === packageId)?.duration_minutes || 60;

        try {
            // By using the same endpoint but passing a flag, we can bypass the wizard constraints
            // or we can create a specific admin endpoint. For simplicity, we create a specialized admin endpoint.
            const res = await fetch('/api/admin/bookings/quick', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service_id: serviceId,
                    package_id: packageId,
                    booking_date: date,
                    start_time: time,
                    client_name: name,
                    client_phone: phone,
                    duration,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'שגיאה ביצירת הזמנה');
            }

            onSuccess();
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('שגיאה בלתי צפויה');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" onClick={onClose} dir="rtl">
            <div
                className="bg-card w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh] p-6 animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <button onClick={onClose} className="text-muted hover:text-primary-text">✕</button>
                    <h2 className="text-xl font-bold text-primary-text">Quick Book (הזמנה מהירה)</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-muted mb-1">שירות</label>
                        <select
                            value={serviceId}
                            onChange={e => {
                                setServiceId(e.target.value);
                                setPackageId('');
                            }}
                            className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text"
                        >
                            <option value="">בחר שירות...</option>
                            {services.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm text-muted mb-1">חבילה</label>
                        <select
                            value={packageId}
                            onChange={e => setPackageId(e.target.value)}
                            disabled={!serviceId}
                            className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text disabled:opacity-50"
                        >
                            <option value="">בחר חבילה...</option>
                            {selectedService?.packages?.map(p => (
                                <option key={p.id} value={p.id}>{p.name} - ₪{p.price}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-muted mb-1">תאריך</label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text"
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-muted mb-1">שעה</label>
                            <input
                                type="time"
                                value={time}
                                onChange={e => setTime(e.target.value)}
                                step="900" // 15 min steps
                                className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-muted mb-1">שם לקוח</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-muted mb-1">טלפון</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text"
                            dir="ltr"
                        />
                    </div>

                    {error && <p className="text-accent text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-2.5 rounded-lg transition-colors mt-6"
                    >
                        {loading ? 'יוצר הזמנה...' : 'הוסף הזמנה'}
                    </button>
                </form>
            </div>
        </div>
    );
}
