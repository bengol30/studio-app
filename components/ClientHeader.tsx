import Link from 'next/link';

export default function ClientHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-primary/95 backdrop-blur-sm px-6 py-4" dir="rtl">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <Link
          href="/admin/login"
          className="text-xs text-muted hover:text-primary-text transition-colors"
        >
          כניסת מנהל
        </Link>

        <nav className="flex items-center gap-1 md:gap-2">
          <Link
            href="/events"
            className="text-sm text-muted hover:text-primary-text transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            אירועים
          </Link>
          <Link
            href="/book"
            className="text-sm bg-accent hover:bg-accent/90 text-white px-4 py-1.5 rounded-lg transition-colors font-medium"
          >
            הזמן
          </Link>
          <Link
            href="/"
            className="text-primary-text font-bold tracking-wide mr-2 md:mr-4"
          >
            Bengo Productions
          </Link>
        </nav>
      </div>
    </header>
  );
}
