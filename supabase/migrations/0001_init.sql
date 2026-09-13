-- Karma · initial schema
-- Matches docs/cadrage.md section 08. Run in the Supabase SQL editor or via `supabase db push`.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete');
create type attention_category as enum ('de_toi', 'materiel', 'moment_a_deux');
create type effort_level as enum ('leger', 'moyen', 'lourd');
create type budget_tier as enum ('zero', 'moins_20', '20_50', '50_150', 'plus_150');
create type attention_status as enum ('draft', 'published', 'retired');
create type occasion_kind as enum ('anniversaire', 'rencontre', 'mariage', 'saint_valentin', 'fete_des_meres', 'noel', 'rentree', 'autre');
create type tag_family as enum ('interest', 'constraint', 'avoid');
create type couple_tag_kind as enum ('loves', 'avoids');
create type attention_tag_kind as enum ('fits', 'avoid');
create type city_type as enum ('grande_ville', 'periurbain', 'campagne');
create type love_language as enum ('mots', 'temps', 'cadeaux', 'services', 'contact');
create type reaction as enum ('adore', 'contente', 'neutre', 'rate');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Admins (Mathieu, Caroline)
-- ---------------------------------------------------------------------------

create table admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'editor' check (role in ('owner', 'editor')),
  created_at timestamptz not null default now()
);

create or replace function is_admin()
returns boolean language sql stable security definer as $$
  select exists (select 1 from admins where id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Members (the man) and couples (the partner + relationship profile)
-- ---------------------------------------------------------------------------

create table members (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  first_name text,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  subscription_status subscription_status not null default 'incomplete',
  send_day smallint not null default 1 check (send_day between 0 and 6),     -- 1 = Monday
  send_hour smallint not null default 8 check (send_hour between 0 and 23),
  send_minute smallint not null default 45 check (send_minute between 0 and 59),
  timezone text not null default 'Europe/Paris',
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger members_updated_at before update on members for each row execute function set_updated_at();

create table couples (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null unique references members(id) on delete cascade,
  partner_first_name text not null,
  years_together smallint check (years_together between 0 and 80),
  partner_birthday date,
  anniversary_date date,            -- date de rencontre ou de mariage
  budget_tier budget_tier not null default '20_50',
  kids jsonb not null default '[]'::jsonb,   -- [{ "age": 4 }, { "age": 9 }]
  has_childcare boolean not null default false,
  city_type city_type,
  love_language love_language,
  free_context text,                -- « ce que tu fais déjà bien, ce qu'elle te reproche »
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger couples_updated_at before update on couples for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Shared tag vocabulary
-- ---------------------------------------------------------------------------

create table tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  family tag_family not null,
  created_at timestamptz not null default now()
);

create table couple_tags (
  couple_id uuid not null references couples(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  kind couple_tag_kind not null,
  primary key (couple_id, tag_id, kind)
);

-- ---------------------------------------------------------------------------
-- Occasions (recurring or one-off dates that matter)
-- ---------------------------------------------------------------------------

create table occasions (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  kind occasion_kind not null,
  label text,
  date date not null,
  recurring boolean not null default true,
  created_at timestamptz not null default now()
);
create index occasions_couple_idx on occasions(couple_id);

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------

create table attentions (
  id uuid primary key default gen_random_uuid(),
  category attention_category not null,
  title text not null,                       -- internal short name, admin only
  base_text text not null,                   -- tutoiement, variables {prenom} {annees} {ville}
  effort effort_level not null default 'leger',
  budget_tier budget_tier not null default 'zero',
  months smallint[] not null default '{}',   -- empty = all year; else 1..12
  occasions occasion_kind[] not null default '{}',
  requires_childcare boolean not null default false,
  requires_big_city boolean not null default false,
  requires_car boolean not null default false,
  url text,
  status attention_status not null default 'draft',
  author_id uuid references admins(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger attentions_updated_at before update on attentions for each row execute function set_updated_at();
create index attentions_status_category_idx on attentions(status, category);

create table attention_tags (
  attention_id uuid not null references attentions(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  kind attention_tag_kind not null,
  primary key (attention_id, tag_id, kind)
);

-- ---------------------------------------------------------------------------
-- Weekly batches and their 3 items
-- ---------------------------------------------------------------------------

create table weekly_batches (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  week_start date not null,                  -- Monday of the week
  generated_at timestamptz not null default now(),
  reviewed_at timestamptz,                   -- « relire avant envoi »
  sent_at timestamptz,
  opened_at timestamptz,
  reminder_sent_at timestamptz,
  unique (member_id, week_start)
);
create index weekly_batches_member_idx on weekly_batches(member_id, week_start desc);

create table batch_items (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references weekly_batches(id) on delete cascade,
  attention_id uuid not null references attentions(id) on delete restrict,
  category attention_category not null,
  personalized_text text not null,           -- generated once, never regenerated (règle 5)
  done_token text not null unique,           -- signed single-use token for « je l'ai faite » (règle 6)
  done_token_expires_at timestamptz not null,
  done_at timestamptz,
  reaction reaction,
  note text,
  unique (batch_id, category)                -- exactly one item per category (règle 2)
);
create index batch_items_attention_idx on batch_items(attention_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table admins enable row level security;
alter table members enable row level security;
alter table couples enable row level security;
alter table tags enable row level security;
alter table couple_tags enable row level security;
alter table occasions enable row level security;
alter table attentions enable row level security;
alter table attention_tags enable row level security;
alter table weekly_batches enable row level security;
alter table batch_items enable row level security;

-- admins: readable by admins only
create policy "admins read admins" on admins for select using (is_admin());

-- members: a member sees and edits himself; admins see everyone
create policy "member reads self" on members for select using (auth.uid() = id or is_admin());
create policy "member updates self" on members for update using (auth.uid() = id) with check (auth.uid() = id);

-- couples: owned by the member
create policy "couple owner all" on couples for all
  using (member_id = auth.uid() or is_admin())
  with check (member_id = auth.uid() or is_admin());

-- couple_tags and occasions: through the couple
create policy "couple_tags owner all" on couple_tags for all
  using (exists (select 1 from couples c where c.id = couple_id and (c.member_id = auth.uid() or is_admin())))
  with check (exists (select 1 from couples c where c.id = couple_id and (c.member_id = auth.uid() or is_admin())));

create policy "occasions owner all" on occasions for all
  using (exists (select 1 from couples c where c.id = couple_id and (c.member_id = auth.uid() or is_admin())))
  with check (exists (select 1 from couples c where c.id = couple_id and (c.member_id = auth.uid() or is_admin())));

-- tags: readable by any authenticated user (needed for the questionnaire), editable by admins
create policy "tags read" on tags for select using (auth.role() = 'authenticated');
create policy "tags admin write" on tags for all using (is_admin()) with check (is_admin());

-- attentions and attention_tags: admins only. Members never read the catalogue directly.
create policy "attentions admin all" on attentions for all using (is_admin()) with check (is_admin());
create policy "attention_tags admin all" on attention_tags for all using (is_admin()) with check (is_admin());

-- batches: a member reads his own history; writes happen server-side with the service role
create policy "batches member read" on weekly_batches for select using (member_id = auth.uid() or is_admin());
create policy "batch_items member read" on batch_items for select
  using (exists (select 1 from weekly_batches b where b.id = batch_id and (b.member_id = auth.uid() or is_admin())));

-- ---------------------------------------------------------------------------
-- Seed: tag vocabulary (extend freely from the admin)
-- ---------------------------------------------------------------------------

insert into tags (slug, label, family) values
  ('lecture', 'Lecture', 'interest'),
  ('cuisine', 'Cuisine', 'interest'),
  ('nature', 'Nature et balades', 'interest'),
  ('sport', 'Sport', 'interest'),
  ('bien_etre', 'Bien-être, spa, massage', 'interest'),
  ('culture', 'Expos, théâtre, cinéma', 'interest'),
  ('musique', 'Musique et concerts', 'interest'),
  ('voyage', 'Voyages et week-ends', 'interest'),
  ('calme', 'Calme et cocooning', 'interest'),
  ('surprises', 'Surprises', 'interest'),
  ('humour', 'Humour', 'interest'),
  ('mode', 'Mode et beauté', 'interest'),
  ('deco', 'Déco et maison', 'interest'),
  ('jardin', 'Jardin et plantes', 'interest'),
  ('resto', 'Restaurants', 'interest'),
  ('pas_de_fleurs', 'N''aime pas les fleurs', 'avoid'),
  ('pas_de_sucre', 'Pas de sucré', 'avoid'),
  ('pas_d_alcool', 'Pas d''alcool', 'avoid'),
  ('vegetarienne', 'Végétarienne', 'avoid'),
  ('pas_de_surprise_publique', 'Pas de surprise en public', 'avoid'),
  ('pas_de_bijoux', 'Ne porte pas de bijoux', 'avoid'),
  ('garde_enfants', 'Nécessite une garde d''enfants', 'constraint'),
  ('grande_ville', 'Nécessite une grande ville', 'constraint'),
  ('voiture', 'Nécessite une voiture', 'constraint');
