require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
    let { data: pendingList } = await supabase.from('bookings').select('id, client_name, status, is_deleted').eq('status', 'pending');
    console.log('Pending without is_deleted filter (Dashboard sees these):', pendingList?.length, pendingList);
    
    let { data: pendingFiltered } = await supabase.from('bookings').select('id, client_name, status, is_deleted').eq('status', 'pending').eq('is_deleted', false);
    console.log('\nPending WITH is_deleted=false filter (Bookings page sees these):', pendingFiltered?.length, pendingFiltered);
})();
