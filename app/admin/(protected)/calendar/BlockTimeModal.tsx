'use client';

import { useState } from 'react';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
    initialDate?: string;
    initialTime?: string;
}

export default function BlockTimeModal({ onClose, onSuccess, initialDate, initialTime }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [date, setDate] = useState(initialDate || '');
    const [startTime, setStartTime] = useState(initialTime || '');
    const [endTime, setEndTime] = useState('');
    const [reason, setReason] = useState('זמן חסום');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !startTime || !endTime || !reason) {
            setError('אנא מלא את כל השדות');
            return;
        }

        if (startTime >= endTime) {
            setError('שעת הסיום חייבת להיות מאוחרת משעת ההתחלה');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/bookings/block', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    booking_date: date,
                    start_time: startTime,
                    end_time: endTime,
                    reason,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'שגיאה בחסימת זמן');
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose} dir="rtl">
            <div
                className="bg-card border border-white/10 rounded-2xl p-6 max-w-sm w-full"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <button onClick={onClose} className="text-muted hover:text-primary-text">✕</button>
                    <h2 className="text-xl font-bold text-primary-text">חסום זמן / יומן</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-muted mb-1">שעת התחלה</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text"
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-muted mb-1">שעת סיום</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                                className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-muted mb-1">סיבה / הערה</label>
                        <input
                            type="text"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text"
                            placeholder="לדוגמה: ישיבת צוות, הפסקה..."
                        />
                    </div>

                    {error && <p className="text-accent text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-6"
                    >
                        {loading ? 'חוסם...' : 'חסום זמן זה'}
                    </button>
                </form>
            </div>
        </div>
    );
}
