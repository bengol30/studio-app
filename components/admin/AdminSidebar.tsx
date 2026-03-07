'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const navItems = [
  { href: '/admin/dashboard', label: 'דשבורד', icon: '🏠' },
  { href: '/admin/bookings', label: 'הזמנות', icon: '📋' },
  { href: '/admin/calendar', label: 'לוח שנה', icon: '📅' },
  { href: '/admin/clients', label: 'לקוחות', icon: '👥' },
  { href: '/admin/events', label: 'אירועים', icon: '🎵' },
  { href: '/admin/tasks', label: 'משימות', icon: '✅' },
  { href: '/admin/services', label: 'שירותים', icon: '🎛️' },
  { href: '/admin/settings', label: 'הגדרות', icon: '⚙️' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="w-56 bg-card border-l border-white/10 flex flex-col min-h-screen sticky top-0">
      <div className="p-5 border-b border-white/10">
        <h2 className="text-lg font-bold text-primary-text">Bengo Productions</h2>
        <p className="text-xs text-muted mt-0.5">מערכת ניהול</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-accent/20 text-accent font-medium'
                  : 'text-muted hover:text-primary-text hover:bg-white/5'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-accent hover:bg-white/5 transition-colors"
        >
          <span>🚪</span>
          <span>יציאה</span>
        </button>
      </div>
    </aside>
  );
}
