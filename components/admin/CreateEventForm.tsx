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

interface CustomField {
  label: string;
  field_type: 'text' | 'textarea' | 'select' | 'checkbox';
  is_required: boolean;
  options: string; // comma-separated for select
}

interface Props {
  createEvent: (formData: FormData) => Promise<void>;
}

export default function CreateEventForm({ createEvent }: Props) {
  const [imageUrl, setImageUrl] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  function addField() {
    setCustomFields(prev => [
      ...prev,
      { label: '', field_type: 'text', is_required: false, options: '' },
    ]);
  }

  function removeField(index: number) {
    setCustomFields(prev => prev.filter((_, i) => i !== index));
  }

  function updateField(index: number, changes: Partial<CustomField>) {
    setCustomFields(prev =>
      prev.map((f, i) => (i === index ? { ...f, ...changes } : f))
    );
  }

  async function handleSubmit(formData: FormData) {
    // Attach serialized custom_fields JSON to form
    formData.set('custom_fields', JSON.stringify(
      customFields.map((f, i) => ({
        label: f.label,
        field_type: f.field_type,
        is_required: f.is_required,
        display_order: i,
        options: f.field_type === 'select'
          ? f.options.split(',').map(o => o.trim()).filter(Boolean)
          : [],
      }))
    ));
    await createEvent(formData);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-muted mb-1 text-right">שם האירוע *</label>
          <input
            type="text"
            name="title"
            required
            className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1 text-right">סוג אירוע *</label>
          <select
            name="event_type"
            required
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
            className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1 text-right">שעה *</label>
          <input
            type="time"
            name="event_time"
            required
            className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1 text-right">מיקום</label>
          <input
            type="text"
            name="location"
            className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1 text-right">מחיר (₪)</label>
          <input
            type="number"
            name="price"
            defaultValue="0"
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
            placeholder="ללא הגבלה"
            className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1 text-right">מארח</label>
          <input
            type="text"
            name="host_name"
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
          className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent resize-none"
        />
      </div>

      {/* ─── שאלות דינמיות ─── */}
      <div className="border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={addField}
            className="text-xs px-3 py-1.5 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors"
          >
            + הוסף שאלה
          </button>
          <h3 className="text-sm font-medium text-primary-text text-right">שאלות הרשמה</h3>
        </div>

        {customFields.length === 0 && (
          <p className="text-xs text-muted text-center py-2">אין שאלות – לחץ &quot;הוסף שאלה&quot; להוספה</p>
        )}

        {customFields.map((field, idx) => (
          <div key={idx} className="bg-primary rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => removeField(idx)}
                className="text-xs text-muted hover:text-red-400 transition-colors"
              >
                הסר
              </button>
              <span className="text-xs text-muted">שאלה {idx + 1}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-muted mb-1 text-right">סוג שדה</label>
                <select
                  value={field.field_type}
                  onChange={e => updateField(idx, { field_type: e.target.value as CustomField['field_type'] })}
                  className="w-full bg-card border border-white/10 rounded-lg px-2 py-1.5 text-primary-text text-xs focus:outline-none focus:border-accent"
                >
                  <option value="text">טקסט קצר</option>
                  <option value="textarea">טקסט ארוך</option>
                  <option value="select">בחירה מרשימה</option>
                  <option value="checkbox">אישור (צ׳קבוקס)</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-4">
                <label className="text-xs text-muted">שדה חובה</label>
                <input
                  type="checkbox"
                  checked={field.is_required}
                  onChange={e => updateField(idx, { is_required: e.target.checked })}
                  className="accent-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted mb-1 text-right">טקסט השאלה *</label>
              <input
                type="text"
                value={field.label}
                onChange={e => updateField(idx, { label: e.target.value })}
                placeholder='למשל: "האם יש לך ניסיון מוזיקלי?"'
                className="w-full bg-card border border-white/10 rounded-lg px-2 py-1.5 text-primary-text text-xs focus:outline-none focus:border-accent"
              />
            </div>

            {field.field_type === 'select' && (
              <div>
                <label className="block text-xs text-muted mb-1 text-right">
                  אפשרויות (מפרידים בפסיק)
                </label>
                <input
                  type="text"
                  value={field.options}
                  onChange={e => updateField(idx, { options: e.target.value })}
                  placeholder="למתחילים, ביניים, מתקדמים"
                  className="w-full bg-card border border-white/10 rounded-lg px-2 py-1.5 text-primary-text text-xs focus:outline-none focus:border-accent"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-2.5 rounded-xl transition-colors"
      >
        צור אירוע
      </button>
    </form>
  );
}
