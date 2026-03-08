'use client';

import { useState } from 'react';
import ImageUpload from './ImageUpload';

const EVENT_TYPE_LABELS: Record<string, string> = {
  jam: "ג'אם",
  listening: 'האזנה',
  workshop: 'סדנה',
  performance: 'הופעה',
  podcast: 'פודקאסט',
  other: 'אחר',
};

interface EventData {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  event_time: string;
  location?: string | null;
  price: number;
  max_attendees?: number | null;
  host_name?: string | null;
  image_url?: string | null;
  description?: string | null;
}

interface Props {
  event: EventData;
  updateEvent: (formData: FormData) => Promise<void>;
}

export default function EditEventForm({ event, updateEvent }: Props) {
  const [imageUrl, setImageUrl] = useState(event.image_url ?? '');

  return (
    <form action={updateEvent} className="space-y-4">
      <input type="hidden" name="id" value={event.id} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-muted mb-1 text-right">שם האירוע *</label>
          <input
            type="text"
            name="title"
            required
            defaultValue={event.title}
            className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1 text-right">סוג אירוע *</label>
          <select
            name="event_type"
            required
            defaultValue={event.event_type}
            className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent"
          >
            {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1 text-right">תאריך *</label>
          <input
            type="date"
            name="event_date"
            required
            defaultValue={event.event_date}
            className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1 text-right">שעה *</label>
          <input
            type="time"
            name="event_time"
            required
            defaultValue={event.event_time?.slice(0, 5)}
            className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1 text-right">מיקום</label>
          <input
            type="text"
            name="location"
            defaultValue={event.location ?? ''}
            className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1 text-right">מחיר (₪)</label>
          <input
            type="number"
            name="price"
            defaultValue={event.price}
            min="0"
            step="0.01"
            className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1 text-right">מקסימום משתתפים</label>
          <input
            type="number"
            name="max_attendees"
            min="1"
            defaultValue={event.max_attendees ?? ''}
            placeholder="ללא הגבלה"
            className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1 text-right">מארח</label>
          <input
            type="text"
            name="host_name"
            defaultValue={event.host_name ?? ''}
            className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-muted mb-2 text-right">תמונה</label>
        <ImageUpload name="image_url" value={imageUrl} onChange={setImageUrl} />
      </div>

      <div>
        <label className="block text-xs text-muted mb-1 text-right">תיאור</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={event.description ?? ''}
          className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-2.5 rounded-xl transition-colors"
      >
        שמור שינויים
      </button>
    </form>
  );
}
