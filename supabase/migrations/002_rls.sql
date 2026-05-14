-- Enable RLS on all tables
alter table profiles enable row level security;
alter table opportunities enable row level security;
alter table meddic_scores enable row level security;
alter table contacts enable row level security;
alter table activities enable row level security;
alter table discovery_briefs enable row level security;
alter table proposals enable row level security;
alter table outreach_log enable row level security;
alter table sectors enable row level security;

-- Helper: get current user role
create or replace function get_my_role()
returns user_role as $$
  select role from profiles where id = auth.uid()
$$ language sql security definer;

-- PROFILES
create policy "Users can view all profiles" on profiles
  for select using (auth.uid() is not null);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Admins can insert profiles" on profiles
  for insert with check (get_my_role() = 'admin');

create policy "Admins can update any profile" on profiles
  for update using (get_my_role() = 'admin');

-- OPPORTUNITIES
create policy "Admins see all opportunities" on opportunities
  for select using (get_my_role() = 'admin');

create policy "BD reps see own opportunities" on opportunities
  for select using (assigned_to = auth.uid());

create policy "Any authenticated user can insert" on opportunities
  for insert with check (auth.uid() is not null);

create policy "Admins can update any opportunity" on opportunities
  for update using (get_my_role() = 'admin');

create policy "BD reps can update own opportunities" on opportunities
  for update using (assigned_to = auth.uid());

create policy "Admins can delete" on opportunities
  for delete using (get_my_role() = 'admin');

-- MEDDIC SCORES (follow opportunity access)
create policy "View meddic for accessible opportunities" on meddic_scores
  for select using (
    exists (
      select 1 from opportunities o
      where o.id = meddic_scores.opportunity_id
      and (o.assigned_to = auth.uid() or get_my_role() = 'admin')
    )
  );

create policy "Update meddic for accessible opportunities" on meddic_scores
  for all using (
    exists (
      select 1 from opportunities o
      where o.id = meddic_scores.opportunity_id
      and (o.assigned_to = auth.uid() or get_my_role() = 'admin')
    )
  );

-- CONTACTS, ACTIVITIES, DISCOVERY BRIEFS, PROPOSALS, OUTREACH LOG
-- Follow same pattern as meddic_scores
create policy "View contacts for accessible opps" on contacts
  for select using (
    exists (
      select 1 from opportunities o
      where o.id = contacts.opportunity_id
      and (o.assigned_to = auth.uid() or get_my_role() = 'admin')
    )
  );

create policy "Manage contacts for accessible opps" on contacts
  for all using (
    exists (
      select 1 from opportunities o
      where o.id = contacts.opportunity_id
      and (o.assigned_to = auth.uid() or get_my_role() = 'admin')
    )
  );

create policy "View activities for accessible opps" on activities
  for select using (
    exists (
      select 1 from opportunities o
      where o.id = activities.opportunity_id
      and (o.assigned_to = auth.uid() or get_my_role() = 'admin')
    )
  );

create policy "Manage activities for accessible opps" on activities
  for all using (
    exists (
      select 1 from opportunities o
      where o.id = activities.opportunity_id
      and (o.assigned_to = auth.uid() or get_my_role() = 'admin')
    )
  );

create policy "View briefs for accessible opps" on discovery_briefs
  for select using (
    exists (
      select 1 from opportunities o
      where o.id = discovery_briefs.opportunity_id
      and (o.assigned_to = auth.uid() or get_my_role() = 'admin')
    )
  );

create policy "Manage briefs for accessible opps" on discovery_briefs
  for all using (
    exists (
      select 1 from opportunities o
      where o.id = discovery_briefs.opportunity_id
      and (o.assigned_to = auth.uid() or get_my_role() = 'admin')
    )
  );

create policy "View proposals for accessible opps" on proposals
  for select using (
    exists (
      select 1 from opportunities o
      where o.id = proposals.opportunity_id
      and (o.assigned_to = auth.uid() or get_my_role() = 'admin')
    )
  );

create policy "Manage proposals for accessible opps" on proposals
  for all using (
    exists (
      select 1 from opportunities o
      where o.id = proposals.opportunity_id
      and (o.assigned_to = auth.uid() or get_my_role() = 'admin')
    )
  );

create policy "View outreach for accessible opps" on outreach_log
  for select using (
    exists (
      select 1 from opportunities o
      where o.id = outreach_log.opportunity_id
      and (o.assigned_to = auth.uid() or get_my_role() = 'admin')
    )
  );

create policy "Manage outreach for accessible opps" on outreach_log
  for all using (
    exists (
      select 1 from opportunities o
      where o.id = outreach_log.opportunity_id
      and (o.assigned_to = auth.uid() or get_my_role() = 'admin')
    )
  );

-- SECTORS (all authenticated users can view, admins can manage)
create policy "Any user can view sectors" on sectors
  for select using (auth.uid() is not null);

create policy "Admins manage sectors" on sectors
  for all using (get_my_role() = 'admin');
