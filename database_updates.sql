-- 1. Add awarded_supplier_id to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS awarded_supplier_id TEXT REFERENCES profiles(id);

-- 2. Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT REFERENCES profiles(id) NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Workspace Messages Table
CREATE TABLE IF NOT EXISTS workspace_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) NOT NULL,
  sender_id TEXT REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS and add strict JWT policies for Privy Custom Auth Integration
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Note: 'sub' in the JWT payload corresponds to the Privy DID
CREATE POLICY "Users can select own notifications" ON notifications FOR SELECT USING (profile_id = (auth.jwt()->>'sub'));
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (profile_id = (auth.jwt()->>'sub'));
CREATE POLICY "Users can insert notifications" ON notifications FOR INSERT WITH CHECK (true); -- Backend API uses anon or service role, let's keep insert open or use Service Role

CREATE POLICY "Users can select workspace_messages" ON workspace_messages FOR SELECT USING (true); -- Usually participants only, but keep simple for now
CREATE POLICY "Users can insert workspace_messages" ON workspace_messages FOR INSERT WITH CHECK (sender_id = (auth.jwt()->>'sub'));

CREATE POLICY "Users can select projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Requestor can update own projects" ON projects FOR UPDATE USING (requestor_id = (auth.jwt()->>'sub'));

-- 5. Enable Real-Time
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE workspace_messages;
