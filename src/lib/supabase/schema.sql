-- Users profile (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  age integer,
  gender text check (gender in ('male', 'female')),
  weight numeric(5,2),
  height numeric(5,2),
  skeletal_muscle_mass numeric(5,2),
  smi numeric(4,2),
  sarcopenia_stage text check (sarcopenia_stage in ('sarcopenia', 'at-risk', 'normal')),
  daily_protein_target integer,
  caregiver_email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users can manage own profile" on profiles
  for all using (auth.uid() = id);

-- Meal logs
create table if not exists meal_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  logged_at timestamptz default now(),
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  image_url text,
  food_items jsonb,  -- [{name, protein_g, confidence}]
  total_protein_g numeric(6,2) not null,
  notes text
);

alter table meal_logs enable row level security;
create policy "Users can manage own meal logs" on meal_logs
  for all using (auth.uid() = user_id);

-- Storage bucket for meal photos
insert into storage.buckets (id, name, public) values ('meal-photos', 'meal-photos', false)
on conflict do nothing;

create policy "Users can upload own meal photos" on storage.objects
  for insert with check (bucket_id = 'meal-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can read own meal photos" on storage.objects
  for select using (bucket_id = 'meal-photos' and auth.uid()::text = (storage.foldername(name))[1]);
