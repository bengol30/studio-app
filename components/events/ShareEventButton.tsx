'use client';

import { useState } from 'react';

interface ShareEventButtonProps {
    eventTitle: string;
}

export default function ShareEventButton({ eventTitle }: ShareEventButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const getUrl = () => {
        if (typeof window !== 'undefined') {
            return window.location.href;
        }
        return '';
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(getUrl());
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                setIsOpen(false);
            }, 2000);
        } catch {
            // Fallback
            setCopied(false);
        }
    };

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors flex items-center justify-center"
                title="שתף אירוע"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-white/10 rounded-lg shadow-xl overflow-hidden z-20">
                    <a
                        href={`https://wa.me/?text=${encodeURIComponent(`תראו את האירוע הזה: ${eventTitle} ב-Bengo Productions!\n\n${getUrl()}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 text-sm text-primary-text hover:bg-white/5 transition-colors text-right flex items-center justify-between"
                    >
                        <span>WhatsApp</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    </a>
                    <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 text-sm text-primary-text hover:bg-white/5 transition-colors border-t border-white/5 text-right flex items-center justify-between"
                    >
                        <span>Facebook</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                    </a>
                    <button
                        onClick={handleCopy}
                        className="w-full text-right block px-4 py-3 text-sm text-primary-text hover:bg-white/5 transition-colors border-t border-white/5 flex items-center justify-between"
                    >
                        <span>{copied ? 'הועתק!' : 'העתק קישור'}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>
                </div>
            )}
        </div>
    );
}
