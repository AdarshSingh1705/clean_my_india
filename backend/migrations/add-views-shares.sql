-- Add views and shares columns to issues table
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS shares INTEGER DEFAULT 0;

-- Create index for views
CREATE INDEX IF NOT EXISTS idx_issues_views ON issues(views DESC);
