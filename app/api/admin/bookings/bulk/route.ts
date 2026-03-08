import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-server';

export async function PATCH(request: NextRequest) {
    try {
        const authClient = await createClient();
        const { data: { user } } = await authClient.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { ids, status } = body;

        const ALLOWED_STATUSES = ['confirmed', 'rejected', 'cancelled', 'pending'];
        if (!ids || !Array.isArray(ids) || !status || !ALLOWED_STATUSES.includes(status)) {
            return NextResponse.json({ error: 'Bad Request – invalid status' }, { status: 400 });
        }

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('bookings')
            .update({ status })
            .in('id', ids);

        if (error) {
            console.error('Bulk update error:', error);
            return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err) {
        console.error('Bulk update route error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
