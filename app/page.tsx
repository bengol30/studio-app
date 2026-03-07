export default function Home() {
  return (
    <main dir="rtl" className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-primary mb-4">
          אולפן קריית שמונה
        </h1>
        <p className="text-text-secondary text-lg mb-8">
          Bengo Productions – מערכת ניהול אולפן
        </p>
        <div className="bg-bg-card border border-border-c rounded-xl p-8 max-w-md mx-auto">
          <p className="text-text-secondary">
            המערכת בבנייה...
          </p>
        </div>
      </div>
    </main>
  );
}
