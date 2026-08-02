-- Create workspace_messages table for project collaboration and chat
create table if not exists workspace_messages (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  sender_id text references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table workspace_messages enable row level security;

-- Policies for workspace_messages
-- 1. Requestors can view messages for their projects
create policy "Requestors can view workspace messages for their projects" on workspace_messages for select using (
  exists (select 1 from projects where id = workspace_messages.project_id and requestor_id = auth.uid()::text)
);

-- 2. Awarded suppliers can view messages for projects they won
create policy "Awarded suppliers can view workspace messages" on workspace_messages for select using (
  exists (select 1 from projects where id = workspace_messages.project_id and awarded_supplier_id = auth.uid()::text)
);

-- Note: Inserts are handled via the backend API using the Service Role Key, 
-- so we don't strictly need an INSERT policy for the anon/authenticated role.

-- Enable Realtime for workspace_messages (Required for the NotificationBell and Chat to update live)
alter publication supabase_realtime add table workspace_messages;
