create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null,
  role text not null check (role in ('student', 'sensei')),
  dojo_name text,
  city text,
  created_at timestamptz not null default now()
);

create or replace function public.create_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role, dojo_name, city)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Kyodo Member'),
    case when new.raw_user_meta_data ->> 'role' = 'sensei' then 'sensei' else 'student' end,
    new.raw_user_meta_data ->> 'dojo_name',
    new.raw_user_meta_data ->> 'city'
  )
  on conflict (id) do update
  set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.create_profile_for_auth_user();

create table if not exists public.dojos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  city text not null,
  address text not null,
  latitude double precision,
  longitude double precision,
  rating numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  trial_capacity integer not null default 0 check (trial_capacity >= 0),
  description text not null default '',
  sensei_name text not null,
  specialties text[] not null default '{}',
  image_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  check ((latitude is null and longitude is null) or (latitude between -90 and 90 and longitude between -180 and 180))
);

create table if not exists public.trial_classes (
  id uuid primary key default gen_random_uuid(),
  dojo_id uuid not null references public.dojos (id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  format text not null default 'In person',
  level text not null default 'All levels',
  seats_left integer not null default 0 check (seats_left >= 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.training_content (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  duration text not null,
  level text not null,
  description text not null default '',
  thumbnail_url text,
  video_url text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  dojo_id uuid not null references public.dojos (id) on delete cascade,
  trial_class_id uuid references public.trial_classes (id) on delete set null,
  candidate_name text not null,
  email text not null,
  phone text not null default '',
  status text not null default 'new' check (status in ('new', 'contacted', 'booked')),
  created_at timestamptz not null default now()
);

create index if not exists trial_classes_public_schedule_idx
  on public.trial_classes (starts_at) where is_published;
create index if not exists leads_student_created_idx
  on public.leads (student_id, created_at desc);
create index if not exists leads_dojo_created_idx
  on public.leads (dojo_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.dojos enable row level security;
alter table public.trial_classes enable row level security;
alter table public.training_content enable row level security;
alter table public.leads enable row level security;

drop policy if exists "Profiles are readable by their owner" on public.profiles;
create policy "Profiles are readable by their owner"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));
drop policy if exists "Profiles are editable by their owner" on public.profiles;
create policy "Profiles are editable by their owner"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "Published dojos are public" on public.dojos;
create policy "Published dojos are public"
  on public.dojos for select to anon, authenticated
  using (is_published);
drop policy if exists "Senseis can read their own dojos" on public.dojos;
create policy "Senseis can read their own dojos"
  on public.dojos for select to authenticated
  using (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'sensei'
    )
  );
drop policy if exists "Senseis can create unpublished dojos" on public.dojos;
create policy "Senseis can create unpublished dojos"
  on public.dojos for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and is_published = false
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'sensei'
    )
  );
drop policy if exists "Senseis can update their unpublished dojos" on public.dojos;
create policy "Senseis can update their unpublished dojos"
  on public.dojos for update to authenticated
  using (
    owner_id = (select auth.uid())
    and is_published = false
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'sensei'
    )
  )
  with check (owner_id = (select auth.uid()) and is_published = false);

drop policy if exists "Published trial classes are public" on public.trial_classes;
create policy "Published trial classes are public"
  on public.trial_classes for select to anon, authenticated
  using (
    is_published
    and exists (select 1 from public.dojos d where d.id = dojo_id and d.is_published)
  );
drop policy if exists "Senseis can create unpublished trial classes" on public.trial_classes;
create policy "Senseis can create unpublished trial classes"
  on public.trial_classes for insert to authenticated
  with check (
    is_published = false
    and exists (
      select 1 from public.dojos d
      join public.profiles p on p.id = d.owner_id
      where d.id = dojo_id and d.owner_id = (select auth.uid()) and p.role = 'sensei'
    )
  );

drop policy if exists "Published training content is public" on public.training_content;
create policy "Published training content is public"
  on public.training_content for select to anon, authenticated
  using (is_published);

drop policy if exists "Students can submit trial requests" on public.leads;
create policy "Students can submit trial requests"
  on public.leads for insert to authenticated
  with check (
    student_id = (select auth.uid())
    and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'student'
    )
    and status = 'new'
    and exists (select 1 from public.dojos d where d.id = dojo_id and d.is_published)
    and (
      trial_class_id is null
      or exists (
        select 1 from public.trial_classes c
        where c.id = trial_class_id and c.dojo_id = dojo_id
          and c.is_published and c.starts_at > now() and c.seats_left > 0
      )
    )
  );
drop policy if exists "Students and dojo owners can read trial requests" on public.leads;
create policy "Students and dojo owners can read trial requests"
  on public.leads for select to authenticated
  using (
    student_id = (select auth.uid())
    or exists (
      select 1 from public.dojos d
      where d.id = dojo_id and d.owner_id = (select auth.uid())
    )
  );
drop policy if exists "Dojo owners can update trial request status" on public.leads;
create policy "Dojo owners can update trial request status"
  on public.leads for update to authenticated
  using (
    exists (
      select 1 from public.dojos d
      where d.id = dojo_id and d.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.dojos d
      where d.id = dojo_id and d.owner_id = (select auth.uid())
    )
  );

grant select on public.dojos, public.trial_classes, public.training_content to anon, authenticated;
grant select on public.profiles to authenticated;
grant update (email, full_name, dojo_name, city) on public.profiles to authenticated;
grant insert, select on public.leads to authenticated;
grant update (status) on public.leads to authenticated;
grant insert, select, update on public.dojos, public.trial_classes to authenticated;
