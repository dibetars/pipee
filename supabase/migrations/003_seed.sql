-- Admin profile (auth user: emery@krontiva.africa)
insert into profiles (id, name, role)
values ('8580ff1d-b26c-4e3f-aa91-21f80366fa67', 'Emery', 'admin')
on conflict (id) do nothing;

-- Seed priority sectors from the Krongage BD Framework
insert into sectors (name, description, is_priority) values
  ('Financial Services', 'Banks, microfinance, insurance, fintech', true),
  ('Healthcare', 'Hospitals, clinics, pharmacies, health tech', true),
  ('Retail & FMCG', 'Supermarkets, distributors, consumer goods', true),
  ('Education', 'Universities, schools, edtech platforms', true),
  ('Hospitality & Tourism', 'Hotels, restaurants, travel agencies', false),
  ('Logistics & Supply Chain', 'Freight, warehousing, last-mile delivery', false),
  ('Government & Public Sector', 'MDAs, local government, public utilities', false),
  ('Telecoms & Technology', 'ISPs, SaaS companies, tech startups', false);
