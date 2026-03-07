export default function Loading() {
  return (
    <main className="min-h-screen bg-primary flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted text-sm">טוען שירותים...</p>
      </div>
    </main>
  );
}
