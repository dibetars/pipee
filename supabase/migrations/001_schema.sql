-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enums
create type user_role as enum ('admin', 'bd_rep');
create type opportunity_status as enum ('active', 'stalled', 'won', 'lost', 'disqualified');
create type disqualification_reason as enum ('NO_FIT', 'NO_PAIN', 'NO_BUDGET', 'NO_AUTHORITY', 'NO_TIMELINE', 'COMPETITOR');
create type contact_role as enum ('champion', 'economic_buyer', 'stakeholder', 'other');
create type activity_type as enum ('call', 'email', 'meeting', 'note', 'stage_change', 'outreach');
create type proposal_status as enum ('draft', 'submitted', 'accepted', 'rejected');
create type outreach_channel as enum ('email', 'linkedin', 'phone', 'other');

-- Profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role user_role not null default 'bd_rep',
  avatar_url text,
  sectors text[] default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Opportunities
create table opportunities (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  company_name text not null,
  sector text,
  website text,
  stage integer not null default 1 check (stage between 1 and 7),
  status opportunity_status not null default 'active',
  assigned_to uuid references profiles(id) on delete set null,
  value numeric(12,2),
  currency text not null default 'GHS',
  disqualification_reason disqualification_reason,
  next_action text,
  next_action_date date,
  stage_entered_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- MEDDIC Scores (one per opportunity)
create table meddic_scores (
  id uuid primary key default uuid_generate_v4(),
  opportunity_id uuid not null unique references opportunities(id) on delete cascade,
  metrics_evidence text,
  economic_buyer_name text,
  economic_buyer_title text,
  decision_criteria text,
  decision_process text,
  identified_pain text,
  champion_name text,
  score integer not null default 0 check (score between 0 and 6),
  updated_at timestamptz not null default now()
);

-- Contacts
create table contacts (
  id uuid primary key default uuid_generate_v4(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  name text not null,
  title text,
  role contact_role not null default 'stakeholder',
  email text,
  phone text,
  linkedin_url text,
  created_at timestamptz not null default now()
);

-- Activities
create table activities (
  id uuid primary key default uuid_generate_v4(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  type activity_type not null,
  title text not null,
  description text,
  outcome text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Discovery Briefs
create table discovery_briefs (
  id uuid primary key default uuid_generate_v4(),
  opportunity_id uuid not null unique references opportunities(id) on delete cascade,
  context text,
  pain_points text,
  success_criteria text,
  constraints text,
  reviewed_by uuid references profiles(id) on delete set null,
  filed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Proposals
create table proposals (
  id uuid primary key default uuid_generate_v4(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  version integer not null default 1,
  status proposal_status not null default 'draft',
  scope text,
  value numeric(12,2),
  currency text not null default 'GHS',
  payment_schedule text,
  submitted_at timestamptz,
  accepted_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

-- Outreach Log
create table outreach_log (
  id uuid primary key default uuid_generate_v4(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  channel outreach_channel not null,
  attempt_number integer not null default 1,
  outcome text,
  occurred_at timestamptz not null default now()
);

-- Sectors config
create table sectors (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  icp_notes text,
  is_priority boolean not null default false,
  created_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger opportunities_updated_at
  before update on opportunities
  for each row execute function update_updated_at();
