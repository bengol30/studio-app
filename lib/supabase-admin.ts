import { createClient } from '@supabase/supabase-js';

// Service role client – SERVER ONLY! Never import in client components.
// Used for operations that bypass RLS (e.g., booking creation, admin operations).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}
