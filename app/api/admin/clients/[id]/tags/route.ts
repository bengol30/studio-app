import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-server';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authClient = await createClient();
        const { data: { user } } = await authClient.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        if (!id) {
            return NextResponse.json({ error: 'Missing client id' }, { status: 400 });
        }

        const body = await request.json();
        const { tags } = body;

        if (!Array.isArray(tags)) {
            return NextResponse.json({ error: 'Tags must be an array' }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('clients')
            .update({ tags })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Update client tags error:', error);
            return NextResponse.json({ error: 'Failed to update tags' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err) {
        console.error('Update client tags route error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
