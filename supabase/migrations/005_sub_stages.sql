-- Sub-stage progress: tracks individual checklist items within each stage
create table if not exists sub_stage_progress (
  id              uuid primary key default uuid_generate_v4(),
  opportunity_id  uuid not null references opportunities(id) on delete cascade,
  sub_stage_key   text not null,           -- e.g. '1a', '2c', '7d'
  completed_at    timestamptz not null default now(),
  completed_by    uuid references profiles(id) on delete set null,
  unique (opportunity_id, sub_stage_key)
);

alter table sub_stage_progress enable row level security;

-- Follow opportunity access: same users who can see an opportunity can see its sub-stages
create policy "View sub-stages for accessible opportunities" on sub_stage_progress
  for select using (
    exists (
      select 1 from opportunities o
      where o.id = sub_stage_progress.opportunity_id
        and (o.assigned_to = auth.uid() or get_my_role() = 'admin')
    )
  );

create policy "Manage sub-stages for accessible opportunities" on sub_stage_progress
  for all using (
    exists (
      select 1 from opportunities o
      where o.id = sub_stage_progress.opportunity_id
        and (o.assigned_to = auth.uid() or get_my_role() = 'admin')
    )
  );
