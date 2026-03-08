-- Add tags column to clients table
ALTER TABLE clients
ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;

-- Optional: Add index for querying clients by specific tags
CREATE INDEX idx_clients_tags ON clients USING GIN (tags);
