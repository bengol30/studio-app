import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-server';
import type { TaskStatus } from '@/types';

export const metadata: Metadata = {
  title: 'משימות | ניהול',
};

export const dynamic = 'force-dynamic';

const STATUS_TABS = [
  { key: 'open', label: 'פתוחות' },
  { key: 'in_progress', label: 'בביצוע' },
  { key: 'done', label: 'הושלמו' },
] as const;

const STATUS_COLORS: Record<TaskStatus, string> = {
  open: 'text-yellow-400 bg-yellow-400/10',
  in_progress: 'text-blue-400 bg-blue-400/10',
  done: 'text-green-400 bg-green-400/10',
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  open: 'פתוחה',
  in_progress: 'בביצוע',
  done: 'הושלם',
};

async function getTasks(status: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('tasks')
    .select('*, clients(name, phone)')
    .eq('status', status)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });
  return data ?? [];
}

async function getClients() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('clients')
    .select('id, name, phone')
    .eq('is_deleted', false)
    .order('name');
  return data ?? [];
}

async function createTask(formData: FormData) {
  'use server';
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect('/admin/login');

  const supabase = createAdminClient();
  const clientId = formData.get('client_id') as string;
  const dueDate = formData.get('due_date') as string;
  await supabase.from('tasks').insert({
    title: formData.get('title') as string,
    description: formData.get('description') as string || null,
    client_id: clientId || null,
    due_date: dueDate || null,
    status: 'open',
  });
  revalidatePath('/admin/tasks');
}

async function updateTaskStatus(formData: FormData) {
  'use server';
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect('/admin/login');

  const id = formData.get('id') as string;
  const status = formData.get('status') as TaskStatus;
  const supabase = createAdminClient();
  await supabase.from('tasks').update({ status }).eq('id', id);
  revalidatePath('/admin/tasks');
}

async function deleteTask(formData: FormData) {
  'use server';
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect('/admin/login');

  const id = formData.get('id') as string;
  const supabase = createAdminClient();
  await supabase.from('tasks').delete().eq('id', id);
  revalidatePath('/admin/tasks');
}

function formatDueDate(dateStr: string | null) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((d.getTime() - today.getTime()) / 86400000);
  const label = d.toLocaleDateString('he-IL');
  if (diff < 0) return { label, overdue: true };
  if (diff === 0) return { label: 'היום', overdue: false };
  if (diff === 1) return { label: 'מחר', overdue: false };
  return { label, overdue: false };
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { status?: string; view?: string };
}) {
  const activeStatus = searchParams.status ?? 'open';
  const showCreate = searchParams.view === 'new';

  const [tasks, clients] = await Promise.all([
    getTasks(activeStatus),
    showCreate ? getClients() : Promise.resolve([]),
  ]);

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-primary-text">משימות</h1>
          <p className="text-muted text-sm mt-1">{tasks.length} משימות</p>
        </div>
        <a
          href="/admin/tasks?view=new"
          className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          + משימה חדשה
        </a>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-card rounded-xl border border-white/10 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <a href="/admin/tasks" className="text-xs text-muted hover:text-accent">ביטול</a>
            <h2 className="font-semibold text-primary-text">משימה חדשה</h2>
          </div>
          <form action={createTask} className="space-y-4">
            <div>
              <label className="block text-xs text-muted mb-1 text-right">כותרת *</label>
              <input
                type="text"
                name="title"
                required
                className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted mb-1 text-right">לקוח (אופציונלי)</label>
                <select
                  name="client_id"
                  className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent"
                >
                  <option value="">ללא לקוח</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} – {c.phone}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1 text-right">תאריך יעד</label>
                <input
                  type="date"
                  name="due_date"
                  className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1 text-right">תיאור</label>
              <textarea
                name="description"
                rows={3}
                className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-2.5 rounded-xl transition-colors"
            >
              צור משימה
            </button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-card rounded-xl p-1 w-fit border border-white/10">
        {STATUS_TABS.map(tab => (
          <a
            key={tab.key}
            href={`/admin/tasks?status=${tab.key}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeStatus === tab.key
                ? 'bg-accent/20 text-accent'
                : 'text-muted hover:text-primary-text'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* Tasks list */}
      {tasks.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <p className="text-4xl mb-3">✅</p>
          <p>אין משימות בסטטוס זה</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => {
            const due = formatDueDate(task.due_date);
            const client = task.clients as { name: string; phone: string } | null;
            return (
              <div
                key={task.id}
                className="bg-card rounded-xl border border-white/10 p-5"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2">
                    {activeStatus === 'open' && (
                      <form action={updateTaskStatus}>
                        <input type="hidden" name="id" value={task.id} />
                        <input type="hidden" name="status" value="in_progress" />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                        >
                          התחל
                        </button>
                      </form>
                    )}
                    {activeStatus === 'in_progress' && (
                      <form action={updateTaskStatus}>
                        <input type="hidden" name="id" value={task.id} />
                        <input type="hidden" name="status" value="done" />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                        >
                          סיים
                        </button>
                      </form>
                    )}
                    {activeStatus !== 'open' && (
                      <form action={updateTaskStatus}>
                        <input type="hidden" name="id" value={task.id} />
                        <input type="hidden" name="status" value="open" />
                        <button
                          type="submit"
                          className="px-3 py-1.5 border border-white/10 text-muted rounded-lg text-sm hover:text-primary-text transition-colors"
                        >
                          פתח מחדש
                        </button>
                      </form>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary-text">{task.title}</p>
                    {client && (
                      <p className="text-xs text-muted">{client.name} · {client.phone}</p>
                    )}
                  </div>
                </div>

                {task.description && (
                  <p className="text-sm text-muted mb-3 text-right">{task.description}</p>
                )}

                <div className="flex justify-between items-center">
                  <form action={deleteTask}>
                    <input type="hidden" name="id" value={task.id} />
                    <button type="submit" className="text-xs text-muted hover:text-accent transition-colors">
                      מחק
                    </button>
                  </form>
                  {due && (
                    <span className={`text-xs px-2 py-1 rounded-full ${due.overdue ? 'text-accent bg-accent/10' : 'text-muted bg-white/5'}`}>
                      {due.overdue ? '⚠️ ' : ''}יעד: {due.label}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
