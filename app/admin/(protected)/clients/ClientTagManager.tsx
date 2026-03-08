'use client';

import { useState } from 'react';

// Common predefined tags
const PREDEFINED_TAGS = ['VIP', 'No-show', 'לקוח חדש', 'לקוח חוזר'];

interface Props {
    clientId: string;
    initialTags: string[];
}

export default function ClientTagManager({ clientId, initialTags }: Props) {
    const [tags, setTags] = useState<string[]>(initialTags);
    const [isEditing, setIsEditing] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const saveTags = async (updatedTags: string[]) => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/admin/clients/${clientId}/tags`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tags: updatedTags }),
            });
            if (res.ok) {
                setTags(updatedTags);
            }
        } catch (err) {
            console.error('Failed to update tags', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddTag = (tag: string) => {
        if (!tag.trim()) return;
        if (tags.includes(tag)) return;

        const nextTags = [...tags, tag.trim()];
        saveTags(nextTags);
        setNewTag('');
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const nextTags = tags.filter(t => t !== tagToRemove);
        saveTags(nextTags);
    };

    const getTagColor = (tag: string) => {
        if (tag.toLowerCase() === 'vip') return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
        if (tag.toLowerCase() === 'no-show') return 'bg-red-500/20 text-red-400 border-red-500/30';
        if (tag === 'לקוח חדש') return 'bg-green-500/20 text-green-400 border-green-500/30';
        return 'bg-accent/20 text-accent border-accent/30';
    };

    return (
        <div className="mt-2">
            <div className="flex flex-wrap gap-2 items-center">
                {tags.map(tag => (
                    <span
                        key={tag}
                        className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1 ${getTagColor(tag)}`}
                    >
                        {tag}
                        {isEditing && (
                            <button
                                onClick={() => handleRemoveTag(tag)}
                                disabled={isSaving}
                                className="hover:text-white transition-colors ml-1"
                            >
                                ✕
                            </button>
                        )}
                    </span>
                ))}

                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs text-muted hover:text-primary-text transition-colors px-2 py-1 bg-white/5 rounded-full"
                >
                    {isEditing ? 'סיום עריכה' : '+ תגיות'}
                </button>
            </div>

            {isEditing && (
                <div className="mt-3 p-3 bg-black/20 rounded-lg border border-white/5">
                    <div className="mb-3">
                        <p className="text-xs text-muted mb-2">תגיות נפוצות:</p>
                        <div className="flex flex-wrap gap-1.5">
                            {PREDEFINED_TAGS.filter(t => !tags.includes(t)).map(t => (
                                <button
                                    key={t}
                                    onClick={() => handleAddTag(t)}
                                    disabled={isSaving}
                                    className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 text-muted hover:text-primary-text rounded transition-colors"
                                >
                                    + {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newTag}
                            onChange={e => setNewTag(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddTag(newTag)}
                            placeholder="תגית חדשה..."
                            className="flex-1 bg-primary border border-white/10 rounded px-2 text-sm text-primary-text min-w-0"
                        />
                        <button
                            onClick={() => handleAddTag(newTag)}
                            disabled={isSaving || !newTag.trim()}
                            className="bg-white/10 hover:bg-white/20 px-3 text-sm rounded text-primary-text disabled:opacity-50"
                        >
                            הוסף
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
