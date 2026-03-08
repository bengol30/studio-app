import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { sendGenericWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Only logged in admins can use this endpoint
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { messages } = await request.json() as {
            messages: { name: string; phone: string; message: string; action?: string }[];
        };

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const results = [];
        for (const msg of messages) {
            const success = await sendGenericWhatsAppMessage(msg.name, msg.phone, msg.action ?? 'bulk_whatsapp', msg.message);
            results.push({ phone: msg.phone, success });
        }

        return NextResponse.json({ success: true, results });

    } catch (error) {
        console.error('[API] /admin/whatsapp error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
