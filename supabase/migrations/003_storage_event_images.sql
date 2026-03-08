-- Create public storage bucket for event images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-images',
  'event-images',
  true,
  5242880, -- 5MB
  array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
)
on conflict (id) do nothing;

-- Allow public read access
create policy "Public read event images"
  on storage.objects for select
  using (bucket_id = 'event-images');

-- Allow authenticated users (admins) to upload
create policy "Authenticated upload event images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'event-images');

-- Allow authenticated users to delete their uploads
create policy "Authenticated delete event images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'event-images');
