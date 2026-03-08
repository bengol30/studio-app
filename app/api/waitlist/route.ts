import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { sendGenericWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { service_id, client_name, client_phone, requested_date } = body;

        if (!service_id || !client_name || !client_phone || !requested_date) {
            return NextResponse.json({ error: 'חסרים שדות חובה' }, { status: 400 });
        }

        const supabase = createAdminClient();

        // insert waitlist record
        const { data: waitlist, error } = await supabase
            .from('waitlist')
            .insert({
                service_id,
                client_name,
                client_phone,
                requested_date,
            })
            .select()
            .single();

        if (error) {
            console.error('Waitlist insert error:', error);
            return NextResponse.json({ error: 'שגיאה בשמירת הבקשה' }, { status: 500 });
        }

        // Confirm to client via WhatsApp (non-blocking)
        sendGenericWhatsAppMessage(
            client_name,
            client_phone,
            `שלום ${client_name}! נרשמת לרשימת המתנה לתאריך ${requested_date}.\nברגע שיפנה מקום פנוי - תקבל הודעה אוטומטית בוואטסאפ 👌`,
            'waitlist_joined'
        ).catch(() => { });

        return NextResponse.json({ success: true, data: waitlist }, { status: 201 });
    } catch (error) {
        console.error('Waitlist POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
