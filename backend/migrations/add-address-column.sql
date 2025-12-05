-- Add address column to issues table
ALTER TABLE issues ADD COLUMN IF NOT EXISTS address VARCHAR(500);

-- Add index for address searches
CREATE INDEX IF NOT EXISTS idx_issues_address ON issues(address);
