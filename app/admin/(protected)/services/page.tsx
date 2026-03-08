import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-server';

export const metadata: Metadata = {
  title: 'שירותים | ניהול',
};

export const dynamic = 'force-dynamic';

async function getServices() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('services')
    .select('*, packages(*)')
    .eq('is_deleted', false)
    .order('name');
  return (data ?? []).map(s => ({
    ...s,
    packages: (s.packages ?? []).filter((p: { is_deleted: boolean }) => !p.is_deleted),
  }));
}

async function createService(formData: FormData) {
  'use server';
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect('/admin/login');

  const supabase = createAdminClient();
  await supabase.from('services').insert({
    name: formData.get('name') as string,
    description: formData.get('description') as string || null,
    is_active: true,
  });
  revalidatePath('/admin/services');
  revalidatePath('/book');
}

async function toggleServiceActive(formData: FormData) {
  'use server';
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect('/admin/login');

  const id = formData.get('id') as string;
  const is_active = formData.get('is_active') === 'true';
  const supabase = createAdminClient();
  await supabase.from('services').update({ is_active: !is_active }).eq('id', id);
  revalidatePath('/admin/services');
  revalidatePath('/book');
}

async function deleteService(formData: FormData) {
  'use server';
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect('/admin/login');

  const id = formData.get('id') as string;
  const supabase = createAdminClient();
  await supabase.from('services').update({ is_deleted: true }).eq('id', id);
  revalidatePath('/admin/services');
  revalidatePath('/book');
}

async function addPackage(formData: FormData) {
  'use server';
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect('/admin/login');

  const supabase = createAdminClient();
  await supabase.from('packages').insert({
    service_id: formData.get('service_id') as string,
    name: formData.get('name') as string,
    duration_minutes: parseInt(formData.get('duration_minutes') as string) || 60,
    price: parseFloat(formData.get('price') as string) || 0,
    is_active: true,
  });
  revalidatePath('/admin/services');
  revalidatePath('/book');
}

async function togglePackageActive(formData: FormData) {
  'use server';
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect('/admin/login');

  const id = formData.get('id') as string;
  const is_active = formData.get('is_active') === 'true';
  const supabase = createAdminClient();
  await supabase.from('packages').update({ is_active: !is_active }).eq('id', id);
  revalidatePath('/admin/services');
  revalidatePath('/book');
}

async function deletePackage(formData: FormData) {
  'use server';
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect('/admin/login');

  const id = formData.get('id') as string;
  const supabase = createAdminClient();
  await supabase.from('packages').update({ is_deleted: true }).eq('id', id);
  revalidatePath('/admin/services');
  revalidatePath('/book');
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: { view?: string };
}) {
  const showCreate = searchParams.view === 'new';
  const services = await getServices();

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-primary-text">שירותים</h1>
          <p className="text-muted text-sm mt-1">{services.length} שירותים</p>
        </div>
        <a
          href="/admin/services?view=new"
          className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          + שירות חדש
        </a>
      </div>

      {/* Create service form */}
      {showCreate && (
        <div className="bg-card rounded-xl border border-white/10 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <a href="/admin/services" className="text-xs text-muted hover:text-accent">ביטול</a>
            <h2 className="font-semibold text-primary-text">שירות חדש</h2>
          </div>
          <form action={createService} className="space-y-4">
            <div>
              <label className="block text-xs text-muted mb-1 text-right">שם השירות *</label>
              <input
                type="text"
                name="name"
                required
                className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-sm focus:outline-none focus:border-accent"
              />
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
              צור שירות
            </button>
          </form>
        </div>
      )}

      {/* Services list */}
      {services.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <p className="text-4xl mb-3">🎛️</p>
          <p>אין שירותים עדיין</p>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map(service => (
            <div
              key={service.id}
              className="bg-card rounded-xl border border-white/10 p-5"
            >
              {/* Service header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <form action={toggleServiceActive}>
                    <input type="hidden" name="id" value={service.id} />
                    <input type="hidden" name="is_active" value={String(service.is_active)} />
                    <button
                      type="submit"
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        service.is_active
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-white/5 text-muted hover:text-primary-text'
                      }`}
                    >
                      {service.is_active ? 'פעיל' : 'לא פעיל'}
                    </button>
                  </form>
                  <form action={deleteService}>
                    <input type="hidden" name="id" value={service.id} />
                    <button type="submit" className="px-3 py-1.5 text-xs text-muted hover:text-accent transition-colors">
                      מחק
                    </button>
                  </form>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-text">{service.name}</p>
                  {service.description && (
                    <p className="text-xs text-muted mt-0.5">{service.description}</p>
                  )}
                </div>
              </div>

              {/* Packages */}
              <div className="space-y-2 mb-4">
                <p className="text-xs text-muted text-right mb-2">חבילות ({service.packages.length})</p>
                {service.packages.map((pkg: {
                  id: string;
                  name: string;
                  duration_minutes: number;
                  price: number;
                  is_active: boolean;
                }) => (
                  <div
                    key={pkg.id}
                    className="flex justify-between items-center bg-primary rounded-lg px-4 py-3"
                  >
                    <div className="flex gap-2">
                      <form action={togglePackageActive}>
                        <input type="hidden" name="id" value={pkg.id} />
                        <input type="hidden" name="is_active" value={String(pkg.is_active)} />
                        <button
                          type="submit"
                          className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                            pkg.is_active
                              ? 'text-green-400 bg-green-400/10'
                              : 'text-muted bg-white/5'
                          }`}
                        >
                          {pkg.is_active ? 'פעיל' : 'כבוי'}
                        </button>
                      </form>
                      <form action={deletePackage}>
                        <input type="hidden" name="id" value={pkg.id} />
                        <button type="submit" className="text-xs text-muted hover:text-accent transition-colors">
                          מחק
                        </button>
                      </form>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-primary-text">{pkg.name}</span>
                      <span className="text-xs text-muted mr-2">
                        {pkg.duration_minutes} דק׳ · ₪{pkg.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add package form */}
              <details className="group">
                <summary className="text-xs text-accent cursor-pointer text-right hover:underline list-none">
                  + הוסף חבילה
                </summary>
                <form action={addPackage} className="mt-3 space-y-3">
                  <input type="hidden" name="service_id" value={service.id} />
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-muted mb-1 text-right">שם *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-xs focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1 text-right">דקות *</label>
                      <input
                        type="number"
                        name="duration_minutes"
                        required
                        min="15"
                        step="15"
                        defaultValue="60"
                        className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-xs focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1 text-right">מחיר (₪) *</label>
                      <input
                        type="number"
                        name="price"
                        required
                        min="0"
                        step="0.01"
                        defaultValue="0"
                        className="w-full bg-primary border border-white/10 rounded-lg px-3 py-2 text-primary-text text-xs focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-accent/20 text-accent hover:bg-accent/30 font-medium py-2 rounded-lg text-sm transition-colors"
                  >
                    הוסף חבילה
                  </button>
                </form>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
