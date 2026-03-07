export default function Loading() {
  return (
    <div className="p-6 flex items-center justify-center min-h-64" dir="rtl">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-muted text-sm">טוען הגדרות...</p>
      </div>
    </div>
  );
}
