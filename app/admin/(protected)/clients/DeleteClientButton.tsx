'use client';

export default function DeleteClientButton({ id, action }: { id: string; action: (formData: FormData) => Promise<void> }) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs text-muted hover:text-accent transition-colors"
        onClick={(e) => {
          if (!confirm('למחוק לקוח זה?')) e.preventDefault();
        }}
      >
        מחק לקוח
      </button>
    </form>
  );
}
