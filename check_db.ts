import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: pending } = await supabase.from('bookings').select('id, client_name, status').eq('status', 'pending');
    console.log('PENDING BOOKINGS:', pending?.length);
    if (pending) console.table(pending);

    const { data: confirmed } = await supabase.from('bookings').select('id, client_name, status, created_at').eq('status', 'confirmed').order('created_at', { ascending: false }).limit(10);
    console.log('RECENTLY CONFIRMED BOOKINGS:', confirmed?.length);
    if (confirmed) console.table(confirmed);
}

check();
