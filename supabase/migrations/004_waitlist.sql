-- Create the waitlist table
CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  requested_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone can insert into waitlist (public)
CREATE POLICY "Public can insert waitlist" ON waitlist
  FOR INSERT WITH CHECK (true);

-- Only admins can view waitlist
CREATE POLICY "Admins can view waitlist" ON waitlist
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can delete/update waitlist
CREATE POLICY "Admins can manage waitlist" ON waitlist
  FOR ALL USING (auth.role() = 'authenticated');

-- Add index on dates to quickly find waiting users when a date opens up
CREATE INDEX idx_waitlist_date ON waitlist(requested_date);
