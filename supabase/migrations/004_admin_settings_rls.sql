-- admin_settings: stores encrypted-at-rest API keys and config (admin-only)
create table if not exists admin_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

-- RLS: only admins may read or write admin_settings
alter table admin_settings enable row level security;

create policy "Admins can read admin_settings" on admin_settings
  for select using (get_my_role() = 'admin');

create policy "Admins can upsert admin_settings" on admin_settings
  for insert with check (get_my_role() = 'admin');

create policy "Admins can update admin_settings" on admin_settings
  for update using (get_my_role() = 'admin');

create policy "Admins can delete admin_settings" on admin_settings
  for delete using (get_my_role() = 'admin');
