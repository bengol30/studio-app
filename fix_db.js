const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envLocal = fs.readFileSync('.env.local', 'utf8');
const url = envLocal.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].replace(/['"]/g, '').trim();
const key = envLocal.match(/SUPABASE_SERVICE_KEY=(.*)/)[1].replace(/['"]/g, '').trim();

const supabase = createClient(url, key);

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
