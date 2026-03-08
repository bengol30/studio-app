'use client';

import { useEffect } from 'react';

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
            <h2 className="text-2xl font-bold text-primary-text mb-4">משהו השתבש!</h2>
            <p className="text-muted mb-6">{error.message}</p>
            <button
                onClick={() => reset()}
                className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
            >
                נסה שוב
            </button>
        </div>
    );
}
