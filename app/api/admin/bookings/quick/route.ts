import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { createClient } from '@/lib/supabase-server';
import { sendGenericWhatsAppMessage } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
    try {
        const authClient = await createClient();
        const { data: { user } } = await authClient.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { service_id, package_id, booking_date, start_time, client_name, client_phone, duration } = body;

        if (!service_id || !package_id || !booking_date || !start_time || !client_name || !client_phone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // calculate end time
        const end = new Date(`2000-01-01T${start_time}`);
        end.setMinutes(end.getMinutes() + duration);
        const end_time = end.toTimeString().slice(0, 5);

        const supabase = createAdminClient();

        // insert as confirmed immediately, circumventing payment
        const { data, error } = await supabase
            .from('bookings')
            .insert({
                service_id,
                package_id,
                booking_date,
                start_time,
                end_time,
                client_name,
                client_phone,
                status: 'confirmed',
            })
            .select()
            .single();

        if (error) {
            console.error('Quick book insert error:', error);
            return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
        }

        // Notify client via WhatsApp (non-blocking)
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
        sendGenericWhatsAppMessage(
            client_name,
            client_phone,
            `שלום ${client_name}! הזמנה נקבעה עבורך בבנגו פרודקשנס.
תאריך: ${booking_date} | שעה: ${start_time} - ${end_time}
פרטים: ${siteUrl}/booking/${data.token}`,
            'quick_book'
        ).catch(() => { });

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (err) {
        console.error('Quick book route error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
