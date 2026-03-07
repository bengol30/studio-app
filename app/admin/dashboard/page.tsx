import { createClient } from '@/lib/supabase-server';

export const metadata = {
  title: 'דשבורד | Bengo Productions',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-text">שלום 👋</h1>
        <p className="text-muted mt-1">{user?.email}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'הזמנות ממתינות', value: '—', color: 'text-yellow-400' },
          { label: 'הזמנות היום', value: '—', color: 'text-accent' },
          { label: 'לקוחות', value: '—', color: 'text-blue-400' },
          { label: 'אירועים קרובים', value: '—', color: 'text-green-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-card rounded-xl p-5 border border-white/10">
            <p className="text-sm text-muted mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-primary-text mb-4">הזמנות אחרונות</h2>
        <p className="text-muted text-sm">אין נתונים להציג עדיין</p>
      </div>
    </div>
  );
}
