'use client';

import { useState } from 'react';

// Matches BookingRow in the page
interface BookingRow {
    id: string;
    client_name: string;
    client_phone: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    status: string;
    dynamic_answers: Record<string, string> | null;
    files_url: string | null;
    services: { name: string } | null;
    packages: { name: string; duration_minutes: number; price: number } | null;
}

interface Props {
    bookings: BookingRow[];
    activeStatus: string;
}

const DAYS_HE = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
function formatDate(dateStr: string) {
    const d = new Date(`${dateStr}T00:00:00`);
    return `${DAYS_HE[d.getDay()]}' ${d.toLocaleDateString('he-IL')}`;
}

export default function AdminBookingsList({ bookings, activeStatus }: Props) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isProcessing, setIsProcessing] = useState(false);

    const toggleSelectAll = () => {
        if (selectedIds.size === bookings.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(bookings.map(b => b.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedIds(next);
    };

    const handleBulkAction = async (newStatus: string, specificIds?: string[]) => {
        const idsToUpdate = specificIds || Array.from(selectedIds);
        if (idsToUpdate.length === 0) return;

        if (!specificIds && !confirm(`האם מעדכן סטטוס ל-${newStatus} עבור ${idsToUpdate.length} רשומות?`)) return;

        setIsProcessing(true);
        try {
            const res = await fetch('/api/admin/bookings/bulk', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ids: idsToUpdate,
                    status: newStatus
                }),
            });
            if (res.ok) {
                // Refresh the page or optimistic update
                window.location.reload();
            } else {
                alert('حدث خطأ');
            }
        } catch {
            alert('Network error');
        } finally {
            setIsProcessing(false);
        }
    };

    if (bookings.length === 0) {
        return (
            <div className="text-center py-16 text-muted">
                <p className="text-4xl mb-3">📭</p>
                <p>אין הזמנות בסטטוס זה</p>
            </div>
        );
    }

    const hasSelection = selectedIds.size > 0;

    return (
        <div>
            {/* Bulk Actions Bar */}
            {hasSelection && (
                <div className="bg-card border border-accent/30 rounded-xl p-4 mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sticky top-4 z-10 shadow-lg">
                    <span className="text-sm font-medium text-primary-text">
                        {selectedIds.size} מסומנים
                    </span>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        {activeStatus === 'pending' && (
                            <>
                                <button
                                    onClick={() => handleBulkAction('confirmed')}
                                    disabled={isProcessing}
                                    className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                                >
                                    אשר מסומנים
                                </button>
                                <button
                                    onClick={() => handleBulkAction('rejected')}
                                    disabled={isProcessing}
                                    className="px-3 py-1.5 bg-accent/20 text-accent rounded-lg text-sm hover:bg-accent/30 transition-colors"
                                >
                                    דחה מסומנים
                                </button>
                            </>
                        )}
                        {activeStatus === 'confirmed' && (
                            <button
                                onClick={() => handleBulkAction('cancelled')}
                                disabled={isProcessing}
                                className="px-3 py-1.5 border border-white/10 text-muted rounded-lg text-sm hover:text-accent transition-colors"
                            >
                                בטל מסומנים
                            </button>
                        )}
                        <button
                            onClick={async () => {
                                const selectedBookings = bookings.filter(b => selectedIds.has(b.id));
                                if (selectedBookings.length === 0) return;

                                const msg = prompt(`הקלד הודעת WhatsApp שתישלח ל-${selectedBookings.length} לקוחות:`);
                                if (!msg) return;

                                setIsProcessing(true);
                                try {
                                    const payload = selectedBookings.map(b => ({
                                        name: b.client_name,
                                        phone: b.client_phone,
                                        message: msg
                                    }));

                                    const res = await fetch('/api/admin/whatsapp', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ messages: payload }),
                                    });

                                    if (res.ok) {
                                        alert('הודעות נשלחו בהצלחה ל-Make.com!');
                                    } else {
                                        alert('שגיאה בשליחת הודעות');
                                    }
                                } catch (error) {
                                    console.error(error);
                                    alert('שגיאת רשת בשליחת הודעות');
                                } finally {
                                    setIsProcessing(false);
                                }
                            }}
                            className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                        >
                            הודעת WhatsApp
                        </button>
                    </div>
                </div>
            )}

            {/* Select All Row */}
            <div className="flex items-center gap-3 px-5 mb-3">
                <input
                    type="checkbox"
                    checked={selectedIds.size === bookings.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-white/10 bg-primary accent-accent"
                />
                <span className="text-sm text-muted">בחר הכל</span>
            </div>

            <div className="space-y-3">
                {bookings.map((booking: BookingRow) => (
                    <div
                        key={booking.id}
                        className={`bg-card rounded-xl border p-5 transition-colors flex gap-4 ${selectedIds.has(booking.id) ? 'border-accent bg-accent/5' : 'border-white/10'
                            }`}
                    >
                        <div className="pt-1">
                            <input
                                type="checkbox"
                                checked={selectedIds.has(booking.id)}
                                onChange={() => toggleSelect(booking.id)}
                                className="w-4 h-4 rounded border-white/10 bg-primary accent-accent cursor-pointer"
                            />
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-col-reverse sm:flex-row justify-between items-start sm:items-center mb-3">
                                <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                                    {activeStatus === 'pending' && !hasSelection && (
                                        <>
                                            <button
                                                onClick={() => handleBulkAction('confirmed', [booking.id])}
                                                className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                                            >
                                                אשר
                                            </button>
                                            <button
                                                onClick={() => handleBulkAction('rejected', [booking.id])}
                                                className="px-3 py-1.5 bg-accent/20 text-accent rounded-lg text-sm hover:bg-accent/30 transition-colors"
                                            >
                                                דחה
                                            </button>
                                        </>
                                    )}
                                    {activeStatus === 'confirmed' && !hasSelection && (
                                        <button
                                            onClick={() => handleBulkAction('cancelled', [booking.id])}
                                            className="px-3 py-1.5 border border-white/10 text-muted rounded-lg text-sm hover:text-accent transition-colors"
                                        >
                                            בטל
                                        </button>
                                    )}
                                </div>
                                <div className="text-right w-full sm:w-auto">
                                    <p className="font-semibold text-primary-text">{booking.client_name}</p>
                                    <p className="text-sm text-muted">{booking.client_phone}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-primary rounded-lg px-3 py-2">
                                    <span className="text-muted">שירות: </span>
                                    <span className="text-primary-text">
                                        {booking.services?.name}
                                    </span>
                                </div>
                                <div className="bg-primary rounded-lg px-3 py-2">
                                    <span className="text-muted">חבילה: </span>
                                    <span className="text-primary-text">
                                        {booking.packages?.name}
                                    </span>
                                </div>
                                <div className="bg-primary rounded-lg px-3 py-2">
                                    <span className="text-muted">תאריך: </span>
                                    <span className="text-primary-text">{formatDate(booking.booking_date)}</span>
                                </div>
                                <div className="bg-primary rounded-lg px-3 py-2">
                                    <span className="text-muted">שעה: </span>
                                    <span className="text-primary-text">
                                        {booking.start_time} – {booking.end_time}
                                    </span>
                                </div>
                            </div>

                            {(() => {
                                const answers = booking.dynamic_answers;
                                if (!answers || Object.keys(answers).length === 0) return null;
                                return (
                                    <div className="mt-3 text-xs text-muted">
                                        {Object.entries(answers).map(([k, v]) => (
                                            <span key={k} className="ml-3">{k}: <span className="text-primary-text">{v}</span></span>
                                        ))}
                                    </div>
                                );
                            })()}

                            {booking.files_url && (
                                <a
                                    href={booking.files_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 text-xs text-accent hover:underline block text-right"
                                >
                                    פתח קבצים →
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
