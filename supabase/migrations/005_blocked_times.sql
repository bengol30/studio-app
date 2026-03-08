-- Create the blocked_times table
CREATE TABLE blocked_times (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocked_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE blocked_times ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone can view blocked times (public needs to know when not to book)
CREATE POLICY "Public can view blocked times" ON blocked_times
  FOR SELECT USING (true);

-- Only admins can insert/update/delete blocked times
CREATE POLICY "Admins can manage blocked times" ON blocked_times
  FOR ALL USING (auth.role() = 'authenticated');

-- Add index on dates to quickly filter blocked times in the availability query
CREATE INDEX idx_blocked_times_date ON blocked_times(blocked_date);
