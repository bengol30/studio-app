import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';

const BUCKET = 'event-images';

async function ensureBucket(supabase: ReturnType<typeof createAdminClient>) {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.id === BUCKET);
  if (!exists) {
    await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
    });
  }
}

export async function POST(req: NextRequest) {
  // Auth check
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Create bucket if it doesn't exist yet
  await ensureBucket(supabase);

  const ext = file.name.split('.').pop() ?? 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error('Storage upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

  return NextResponse.json({ url: urlData.publicUrl });
}
