import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-server';
import type { PaymentStatus } from '@/types';
import DeleteClientButton from './DeleteClientButton';
import ClientTagManager from './ClientTagManager';

export const metadata: Metadata = {
  title: 'לקוחות | ניהול',
};

export const dynamic = 'force-dynamic';

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  paid: 'שולם',
  unpaid: 'לא שולם',
  partial: 'חלקי',
};

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  paid: 'text-green-400 bg-green-400/10',
  unpaid: 'text-accent bg-accent/10',
  partial: 'text-yellow-400 bg-yellow-400/10',
};

async function getClients() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });
  return data ?? [];
}

async function getClientBookingCounts() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('bookings')
    .select('client_phone')
    .eq('is_deleted', false)
    .neq('status', 'rejected');

  const counts: Record<string, number> = {};
  (data ?? []).forEach(b => {
    counts[b.client_phone] = (counts[b.client_phone] ?? 0) + 1;
  });
  return counts;
}

async function updateClientPayment(formData: FormData) {
  'use server';
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect('/admin/login');

  const id = formData.get('id') as string;
  const payment_status = formData.get('payment_status') as PaymentStatus;
  const notes = formData.get('notes') as string;

  const supabase = createAdminClient();
  await supabase.from('clients').update({ payment_status, notes }).eq('id', id);
  revalidatePath('/admin/clients');
}

async function deleteClient(formData: FormData) {
  'use server';
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect('/admin/login');

  const id = formData.get('id') as string;
  const supabase = createAdminClient();
  await supabase.from('clients').update({ is_deleted: true }).eq('id', id);
  revalidatePath('/admin/clients');
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const [clients, bookingCounts] = await Promise.all([
    getClients(),
    getClientBookingCounts(),
  ]);

  const search = searchParams.search?.toLowerCase() ?? '';
  const filtered = search
    ? clients.filter(
      c =>
        c.name?.toLowerCase().includes(search) ||
        c.phone?.includes(search)
    )
    : clients;

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-primary-text">לקוחות</h1>
          <p className="text-muted text-sm mt-1">{clients.length} לקוחות סה״כ</p>
        </div>
      </div>

      {/* Search */}
      <form method="GET" className="mb-6">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="חיפוש לפי שם או טלפון..."
          className="w-full max-w-sm bg-card border border-white/10 rounded-xl px-4 py-2.5 text-primary-text text-sm focus:outline-none focus:border-accent placeholder:text-muted"
        />
      </form>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <p className="text-4xl mb-3">👥</p>
          <p>{search ? 'לא נמצאו לקוחות לחיפוש זה' : 'אין לקוחות עדיין'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(client => {
            const payStatus = (client.payment_status as PaymentStatus) ?? 'unpaid';
            const bookCount = bookingCounts[client.phone] ?? 0;
            return (
              <div
                key={client.id}
                className="bg-card rounded-xl border border-white/10 p-5"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2 items-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${PAYMENT_COLORS[payStatus]}`}>
                      {PAYMENT_LABELS[payStatus]}
                    </span>
                    <span className="text-xs text-muted bg-white/5 px-2 py-1 rounded-full">
                      {bookCount} הזמנות
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary-text">{client.name}</p>
                    <p className="text-sm text-muted">{client.phone}</p>
                  </div>
                </div>

                {client.notes && (
                  <p className="text-sm text-muted mb-4 text-right bg-primary rounded-lg px-3 py-2">
                    {client.notes}
                  </p>
                )}

                <div className="mb-4">
                  <ClientTagManager clientId={client.id} initialTags={client.tags || []} />
                </div>

                <form action={updateClientPayment} className="space-y-3">
                  <input type="hidden" name="id" value={client.id} />
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs text-muted mb-1 text-right">הערות</label>
                      <input
                        type="text"
                        name="notes"
                        defaultValue={client.notes ?? ''}
                        className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent"
                        placeholder="הערות ללקוח..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1 text-right">סטטוס תשלום</label>
                      <select
                        name="payment_status"
                        defaultValue={payStatus}
                        className="bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent"
                      >
                        <option value="paid">שולם</option>
                        <option value="unpaid">לא שולם</option>
                        <option value="partial">חלקי</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-accent/20 text-accent rounded-lg text-sm hover:bg-accent/30 transition-colors whitespace-nowrap"
                    >
                      שמור
                    </button>
                  </div>
                </form>

                <div className="mt-3 flex gap-2 justify-between items-center">
                  <DeleteClientButton id={client.id} action={deleteClient} />
                  <a
                    href={`/admin/bookings?phone=${encodeURIComponent(client.phone)}`}
                    className="text-xs text-accent hover:underline"
                  >
                    הזמנות של לקוח זה ←
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
