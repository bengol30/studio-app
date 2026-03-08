'use client';

import { useState } from 'react';
import { format, parseISO, addMinutes } from 'date-fns';

interface AddToCalendarProps {
  booking: {
    title: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm:ss
    endTime: string; // HH:mm:ss
    location?: string;
    description?: string;
  };
}

export default function AddToCalendar({ booking }: AddToCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getDates = () => {
    // We assume Israel time for the studio
    const startDateTime = `${booking.date}T${booking.startTime}`;
    let endDateTime = `${booking.date}T${booking.endTime}`;
    
    // In case endTime is missing or invalid, fallback to start + 1 hour
    if (!booking.endTime) {
      const start = parseISO(startDateTime);
      endDateTime = format(addMinutes(start, 60), "yyyy-MM-dd'T'HH:mm:ss");
    }

    // Convert to UTC for ICS and Google Calendar formats to be safe, 
    // or format them stripped of timezone if we want floating time.
    // For simplicity in a local Israeli app, formatting as basic string often works,
    // but proper ICS requires UTC (Z) or specific timezone.
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    return { start, end };
  };

  const getGoogleCalendarUrl = () => {
    const { start, end } = getDates();
    const formatGoogleDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.append('action', 'TEMPLATE');
    url.searchParams.append('text', booking.title);
    url.searchParams.append('dates', `${formatGoogleDate(start)}/${formatGoogleDate(end)}`);
    
    if (booking.description) {
      url.searchParams.append('details', booking.description);
    }
    if (booking.location) {
      url.searchParams.append('location', booking.location);
    }

    return url.toString();
  };

  const downloadICS = () => {
    const { start, end } = getDates();
    
    // Format: 20231012T153000Z
    const formatIcsDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Bengo Productions//Studio App//HE',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `DTSTART:${formatIcsDate(start)}`,
      `DTEND:${formatIcsDate(end)}`,
      `SUMMARY:${booking.title}`,
      booking.description ? `DESCRIPTION:${booking.description.replace(/\n/g, '\\n')}` : '',
      booking.location ? `LOCATION:${booking.location}` : '',
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean).join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'studio-booking.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-primary-text border border-white/10 rounded-lg px-4 py-2 text-sm transition-colors flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        הוסף ליומן
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-48 bg-card border border-white/10 rounded-lg shadow-xl overflow-hidden z-20 end-0">
          <a
            href={getGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 text-sm text-primary-text hover:bg-white/5 transition-colors text-right"
          >
            Google Calendar
          </a>
          <button
            onClick={downloadICS}
            className="w-full text-right block px-4 py-3 text-sm text-primary-text hover:bg-white/5 transition-colors border-t border-white/5"
          >
            Apple Calendar / Outlook
          </button>
        </div>
      )}
    </div>
  );
}
