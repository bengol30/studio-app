import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: services, error } = await supabase
      .from('services')
      .select(`
        *,
        packages(*),
        service_fields(*)
      `)
      .eq('is_active', true)
      .eq('is_deleted', false)
      .order('name');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Sort packages and fields within each service
    const result = (services ?? []).map(service => ({
      ...service,
      packages: (service.packages ?? [])
        .filter((p: { is_active: boolean; is_deleted: boolean }) => p.is_active && !p.is_deleted)
        .sort((a: { price: number }, b: { price: number }) => a.price - b.price),
      service_fields: (service.service_fields ?? [])
        .sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order),
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
