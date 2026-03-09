'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ClientHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-primary/95 backdrop-blur-sm px-4 md:px-6 py-4" dir="rtl">
      <div className="max-w-5xl mx-auto flex justify-between items-center relative">
        {/* Mobile Hamburger Toggle */}
        <button
          className="md:hidden text-muted hover:text-white transition p-2 -ml-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? '✕' : '☰'}
        </button>

        {/* Desktop Admin Link */}
        <Link
          href="/admin/login"
          className="hidden md:block text-xs text-muted hover:text-primary-text transition-colors"
        >
          כניסת מנהל
        </Link>

        {/* Mobile Admin Link (in hamburger later, or keep hidden on mobile as it's for admins) */}

        <nav className="hidden md:flex items-center gap-1 md:gap-2">
          <Link
            href="/about"
            className="text-sm text-muted hover:text-primary-text transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            תיק עבודות
          </Link>
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

        {/* Mobile Site Title & Book Button for quick access */}
        <div className="flex md:hidden items-center gap-3">
          <Link
            href="/book"
            className="text-xs bg-accent hover:bg-accent/90 text-white px-3 py-1.5 rounded-lg transition-colors font-medium shadow-md shadow-accent/20"
          >
            הזמן
          </Link>
          <Link
            href="/"
            className="text-primary-text font-bold text-sm tracking-wide"
          >
            Bengo Productions
          </Link>
        </div>

      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-primary/95 backdrop-blur-md border-b border-white/10 shadow-xl">
          <nav className="flex flex-col p-4 gap-2">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 text-sm text-primary-text hover:bg-white/5 rounded-lg transition-colors"
            >
              דף הבית
            </Link>
            <Link
              href="/events"
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 text-sm text-primary-text hover:bg-white/5 rounded-lg transition-colors"
            >
              אירועים
            </Link>
            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 text-sm text-primary-text hover:bg-white/5 rounded-lg transition-colors"
            >
              תיק עבודות
            </Link>
            <div className="h-px bg-white/10 my-2 mx-2" />
            <Link
              href="/admin/login"
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 text-sm text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              כניסת מנהל
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
