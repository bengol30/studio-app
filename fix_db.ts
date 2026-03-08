import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDb() {
    const { data, error } = await supabase
        .from('bookings')
        .update({ is_deleted: false })
        .is('is_deleted', null);

    if (error) {
        console.error('Error fixing db:', error);
    } else {
        console.log('Successfully fixed DB NULLs for is_deleted');
    }
}

fixDb();
