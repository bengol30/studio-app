import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
    try {
        const authClient = await createClient();
        const { data: { user } } = await authClient.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { booking_date, start_time, end_time, reason } = body;

        if (!booking_date || !start_time || !end_time) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('blocked_times')
            .insert({
                blocked_date: booking_date,
                start_time,
                end_time,
                reason: reason || 'Blocked',
            })
            .select()
            .single();

        if (error) {
            console.error('Block time insert error:', error);
            return NextResponse.json({ error: 'Failed to block time' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (err) {
        console.error('Block time route error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
