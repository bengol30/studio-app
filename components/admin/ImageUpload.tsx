'use client';

import { useState, useRef } from 'react';

interface Props {
  name: string;
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ name, value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'שגיאה בהעלאה');
      onChange(json.url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'שגיאה בהעלאה');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {/* Hidden field carries the URL into the Server Action formData */}
      <input type="hidden" name={name} value={value} />

      <div
        className={`relative border-2 border-dashed rounded-xl transition-colors cursor-pointer ${
          uploading ? 'border-accent/50' : 'border-white/15 hover:border-accent/40'
        }`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); }}
        onDrop={e => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        {value ? (
          <div className="relative h-32 rounded-xl overflow-hidden">
            <img src={value} alt="תמונה" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(''); }}
              className="absolute top-2 left-2 w-6 h-6 bg-black/60 text-white rounded-full text-xs flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="py-8 text-center">
            {uploading ? (
              <div className="text-accent text-sm animate-pulse">מעלה תמונה...</div>
            ) : (
              <>
                <div className="text-3xl mb-2 opacity-40">🖼️</div>
                <p className="text-xs text-muted">לחץ או גרור תמונה לכאן</p>
                <p className="text-xs text-muted/60 mt-1">JPG, PNG, WEBP, GIF עד 5MB</p>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />

      {error && <p className="text-xs text-red-400 mt-1 text-right">{error}</p>}
    </div>
  );
}
