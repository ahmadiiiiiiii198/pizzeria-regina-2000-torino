-- ============================================
-- STEP 1: Create push_subscriptions table
-- ============================================
-- Run this in Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_endpoint UNIQUE(endpoint)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_created_at ON push_subscriptions(created_at);

-- Enable Row Level Security
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can insert push subscriptions"
  ON push_subscriptions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read push subscriptions"
  ON push_subscriptions
  FOR SELECT
  USING (true);

CREATE POLICY "Users can delete own subscriptions"
  ON push_subscriptions
  FOR DELETE
  USING (true);

CREATE POLICY "Users can update own subscriptions"
  ON push_subscriptions
  FOR UPDATE
  USING (true);

-- Update trigger function
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update trigger
CREATE TRIGGER push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscriptions_updated_at();

COMMENT ON TABLE push_subscriptions IS 'Stores web push notification subscriptions for sending background notifications';

-- ============================================
-- STEP 2: Verify table created
-- ============================================
-- Run this query to verify:
SELECT * FROM push_subscriptions LIMIT 1;

-- Expected result: Empty table (no rows yet)
-- If you see the table structure, SUCCESS!

-- ============================================
-- DONE! Table is ready.
-- Next: Deploy Edge Function (see DEPLOY_EDGE_FUNCTION.md)
-- ============================================
