'use client';

import { useRouter } from 'next/navigation';

interface ReBookButtonProps {
    booking: {
        service_id: string;
        client_name: string;
        client_phone: string;
    };
}

export default function ReBookButton({ booking }: ReBookButtonProps) {
    const router = useRouter();

    const handleRebook = () => {
        const params = new URLSearchParams({
            serviceId: booking.service_id,
            name: booking.client_name,
            phone: booking.client_phone,
        });
        router.push(`/book?${params.toString()}`);
    };

    return (
        <button
            onClick={handleRebook}
            className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors flex items-center justify-center gap-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
            קבע תור חדש
        </button>
    );
}
