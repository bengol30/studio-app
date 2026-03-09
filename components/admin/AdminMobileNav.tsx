'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase';

const navItems = [
    { href: '/admin/dashboard', label: 'דשבורד', icon: '🏠' },
    { href: '/admin/bookings', label: 'הזמנות', icon: '📋' },
    { href: '/admin/calendar', label: 'לוח שנה', icon: '📅' },
    { href: '/admin/clients', label: 'לקוחות', icon: '👥' },
    { href: '/admin/events', label: 'אירועים', icon: '🎵' },
    { href: '/admin/tasks', label: 'משימות', icon: '✅' },
    { href: '/admin/portfolio', label: 'תיק עבודות', icon: '🖼️' },
    { href: '/admin/services', label: 'שירותים', icon: '🎛️' },
    { href: '/admin/settings', label: 'הגדרות', icon: '⚙️' },
];

export default function AdminMobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/admin/login');
        router.refresh();
    }

    return (
        <>
            {/* Mobile Top Bar */}
            <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-white/10 sticky top-0 z-40">
                <div>
                    <h2 className="text-lg font-bold text-primary-text">Bengo Productions</h2>
                    <p className="text-xs text-muted">מערכת ניהול</p>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-primary-text hover:text-white transition-colors p-2"
                    aria-label="Toggle admin menu"
                >
                    {isOpen ? '✕' : '☰'}
                </button>
            </header>

            {/* Mobile Drawer Overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                >
                    {/* Drawer Content */}
                    <aside
                        className="w-64 bg-card h-full flex flex-col border-l border-white/10"
                        onClick={(e) => e.stopPropagation()}
                        dir="rtl"
                    >
                        <nav className="flex-1 p-3 space-y-1 mt-4 overflow-y-auto">
                            {navItems.map(item => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${isActive
                                            ? 'bg-accent/20 text-accent font-medium'
                                            : 'text-muted hover:text-primary-text hover:bg-white/5'
                                            }`}
                                    >
                                        <span className="text-lg">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-4 border-t border-white/10">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted hover:text-accent hover:bg-white/5 transition-colors"
                            >
                                <span className="text-lg">🚪</span>
                                <span>יציאה</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </>
    );
}
