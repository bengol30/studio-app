'use client';

import { useState } from 'react';
import type { PortfolioItem, PortfolioSettings } from './page';

interface ColorOption { label: string; value: string; }

interface Props {
    initialSettings: PortfolioSettings;
    colors: ColorOption[];
    savePortfolioSettings: (formData: FormData) => Promise<void>;
}

const EMOJIS = ['🎵', '🎙️', '🎸', '🎤', '🎛️', '📻', '🎹', '🥁', '🎺', '🎻', '🎧', '🔊'];

export default function PortfolioEditor({ initialSettings, colors, savePortfolioSettings }: Props) {
    const [settings, setSettings] = useState<PortfolioSettings>(initialSettings);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    function updateStudio(changes: Partial<PortfolioSettings>) {
        setSettings(prev => ({ ...prev, ...changes }));
    }

    function addItem() {
        const newItem: PortfolioItem = {
            id: Date.now().toString(),
            title: 'כותרת חדשה',
            type: 'סוג',
            year: new Date().getFullYear().toString(),
            emoji: '🎵',
            color: colors[0].value,
        };
        setSettings(prev => ({ ...prev, items: [...prev.items, newItem] }));
    }

    function removeItem(id: string) {
        setSettings(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
    }

    function updateItem(id: string, changes: Partial<PortfolioItem>) {
        setSettings(prev => ({
            ...prev,
            items: prev.items.map(i => i.id === id ? { ...i, ...changes } : i),
        }));
    }

    function moveItem(id: string, dir: 'up' | 'down') {
        setSettings(prev => {
            const items = [...prev.items];
            const idx = items.findIndex(i => i.id === id);
            if (dir === 'up' && idx > 0) [items[idx], items[idx - 1]] = [items[idx - 1], items[idx]];
            if (dir === 'down' && idx < items.length - 1) [items[idx], items[idx + 1]] = [items[idx + 1], items[idx]];
            return { ...prev, items };
        });
    }

    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        const formData = new FormData();
        formData.set('portfolio_json', JSON.stringify(settings));
        await savePortfolioSettings(formData);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    return (
        <form onSubmit={handleSave} className="space-y-6">
            {/* Studio info */}
            <div className="bg-card rounded-xl border border-white/10 p-5 space-y-4">
                <h2 className="font-semibold text-primary-text text-right">מידע על האולפן</h2>

                <div>
                    <label className="block text-xs text-muted mb-1 text-right">כותרת ראשית</label>
                    <input
                        type="text"
                        value={settings.studio_title}
                        onChange={e => updateStudio({ studio_title: e.target.value })}
                        className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent"
                    />
                </div>

                <div>
                    <label className="block text-xs text-muted mb-1 text-right">תיאור קצר (מטא - מופיע מתחת לכותרת)</label>
                    <input
                        type="text"
                        value={settings.studio_description}
                        onChange={e => updateStudio({ studio_description: e.target.value })}
                        className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent"
                    />
                </div>

                <div>
                    <label className="block text-xs text-muted mb-1 text-right">טקסט &quot;מי אנחנו&quot;</label>
                    <textarea
                        value={settings.studio_about}
                        onChange={e => updateStudio({ studio_about: e.target.value })}
                        rows={4}
                        className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent resize-none"
                    />
                </div>
            </div>

            {/* Portfolio items */}
            <div className="bg-card rounded-xl border border-white/10 p-5 space-y-4">
                <div className="flex justify-between items-center">
                    <button
                        type="button"
                        onClick={addItem}
                        className="text-sm px-3 py-1.5 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors"
                    >
                        + הוסף פריט
                    </button>
                    <h2 className="font-semibold text-primary-text">פריטי גלריה ({settings.items.length})</h2>
                </div>

                {settings.items.length === 0 && (
                    <p className="text-sm text-muted text-center py-4">אין פריטים עדיין – לחץ &quot;הוסף פריט&quot;</p>
                )}

                <div className="space-y-3">
                    {settings.items.map((item, idx) => (
                        <div key={item.id} className="bg-primary rounded-xl p-4 border border-white/5 space-y-3">
                            {/* Header row */}
                            <div className="flex justify-between items-center">
                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        onClick={() => moveItem(item.id, 'up')}
                                        disabled={idx === 0}
                                        className="text-xs px-2 py-1 text-muted hover:text-primary-text disabled:opacity-30 transition-colors"
                                    >↑</button>
                                    <button
                                        type="button"
                                        onClick={() => moveItem(item.id, 'down')}
                                        disabled={idx === settings.items.length - 1}
                                        className="text-xs px-2 py-1 text-muted hover:text-primary-text disabled:opacity-30 transition-colors"
                                    >↓</button>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        className="text-xs px-2 py-1 text-muted hover:text-red-400 transition-colors mr-1"
                                    >
                                        הסר
                                    </button>
                                </div>

                                {/* Preview */}
                                <div className={`h-10 w-24 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-lg`}>
                                    {item.emoji}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-muted mb-1 text-right">כותרת</label>
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={e => updateItem(item.id, { title: e.target.value })}
                                        className="w-full bg-card border border-white/10 rounded-lg px-2 py-1.5 text-primary-text text-xs focus:outline-none focus:border-accent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-muted mb-1 text-right">סוג</label>
                                    <input
                                        type="text"
                                        value={item.type}
                                        onChange={e => updateItem(item.id, { type: e.target.value })}
                                        className="w-full bg-card border border-white/10 rounded-lg px-2 py-1.5 text-primary-text text-xs focus:outline-none focus:border-accent"
                                        placeholder="אלבום / סינגל / פודקאסט..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-muted mb-1 text-right">שנה</label>
                                    <input
                                        type="text"
                                        value={item.year}
                                        onChange={e => updateItem(item.id, { year: e.target.value })}
                                        className="w-full bg-card border border-white/10 rounded-lg px-2 py-1.5 text-primary-text text-xs focus:outline-none focus:border-accent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-muted mb-1 text-right">אימוג&#39;י</label>
                                    <div className="flex flex-wrap gap-1">
                                        {EMOJIS.map(e => (
                                            <button
                                                key={e}
                                                type="button"
                                                onClick={() => updateItem(item.id, { emoji: e })}
                                                className={`text-lg p-0.5 rounded transition-colors ${item.emoji === e ? 'bg-accent/30 ring-1 ring-accent' : 'hover:bg-white/10'}`}
                                            >
                                                {e}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-muted mb-1 text-right">קישור לתמונה (אופציונלי)</label>
                                    <input
                                        type="url"
                                        value={item.image_url ?? ''}
                                        onChange={e => updateItem(item.id, { image_url: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full bg-card border border-white/10 rounded-lg px-2 py-1.5 text-primary-text text-xs focus:outline-none focus:border-accent"
                                        dir="ltr"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-muted mb-1 text-right">צבע רקע</label>
                                    <select
                                        value={item.color}
                                        onChange={e => updateItem(item.id, { color: e.target.value })}
                                        className="w-full bg-card border border-white/10 rounded-lg px-2 py-1.5 text-primary-text text-xs focus:outline-none focus:border-accent"
                                    >
                                        {colors.map(c => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                disabled={saving}
                className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
            >
                {saving ? 'שומר...' : saved ? '✅ נשמר!' : 'שמור שינויים'}
            </button>
        </form>
    );
}
