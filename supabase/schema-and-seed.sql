create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null check (role in ('admin', 'editor')) default 'editor',
  created_at timestamptz not null default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  category text not null,
  excerpt text not null default '',
  content_html text not null,
  thumbnail_url text not null,
  video_url text,
  budget_total bigint not null default 0,
  budget_realized bigint not null default 0,
  progress_percent int not null default 0 check (progress_percent between 0 and 100),
  status text not null check (status in ('planning', 'ongoing', 'done')) default 'planning',
  published_at timestamptz not null default now(),
  author_id uuid references users(id) on delete set null,
  author_name text not null default 'Pemerintah Kota Palembang',
  created_at timestamptz not null default now()
);

create table if not exists budget_items (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  item_name text not null,
  allocated_amount bigint not null default 0,
  realized_amount bigint not null default 0,
  description text not null default ''
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  anonymous_name text not null,
  content_raw text not null,
  content_filtered text not null,
  is_filtered boolean not null default false,
  is_pinned boolean not null default false,
  is_deleted boolean not null default false,
  admin_reply text,
  created_at timestamptz not null default now()
);

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  type text not null check (type in ('image', 'video')),
  url text not null,
  caption text,
  uploaded_at timestamptz not null default now()
);

alter table users enable row level security;
alter table posts enable row level security;
alter table budget_items enable row level security;
alter table comments enable row level security;
alter table media enable row level security;

drop policy if exists "Public can read posts" on posts;
create policy "Public can read posts" on posts for select using (true);

drop policy if exists "Public can read budget items" on budget_items;
create policy "Public can read budget items" on budget_items for select using (true);

drop policy if exists "Public can read comments" on comments;
create policy "Public can read comments" on comments for select using (is_deleted = false);

drop policy if exists "Public can insert comments" on comments;
create policy "Public can insert comments" on comments for insert with check (true);

drop policy if exists "Public can read media" on media;
create policy "Public can read media" on media for select using (true);

drop policy if exists "Authenticated admins can manage posts" on posts;
create policy "Authenticated admins can manage posts" on posts for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated admins can manage comments" on comments;
create policy "Authenticated admins can manage comments" on comments for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated admins can manage budget" on budget_items;
create policy "Authenticated admins can manage budget" on budget_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

insert into users (name, email, password_hash, role)
values ('Admin Pemerintah Kota Palembang', 'admin@palembang.go.id', '$2a$10$demo.hash.replace.with.real.bcrypt', 'admin')
on conflict (email) do nothing;

with admin_user as (
  select id from users where email = 'admin@palembang.go.id' limit 1
), inserted_posts as (
  insert into posts (title, slug, category, excerpt, content_html, thumbnail_url, video_url, budget_total, budget_realized, progress_percent, status, published_at, author_id, author_name)
  values
  ('Revitalisasi Trotoar dan Drainase Koridor Sudirman Dimulai Mei 2026', 'revitalisasi-trotoar-drainase-sudirman', 'Pembangunan', 'Pemerintah Kota Palembang mempercepat perbaikan pedestrian dan saluran air.', '<p>Program revitalisasi koridor Sudirman difokuskan pada pelebaran trotoar, akses difabel, dan pembenahan drainase.</p>', 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80', 'https://www.youtube.com/embed/Dl2x7s4bV6A', 18500000000, 9200000000, 49, 'ongoing', '2026-05-01 08:00:00+00', (select id from admin_user), 'Dinas PUPR Kota Palembang'),
  ('Perbaikan Jalan Lingkungan Kecamatan Seberang Ulu I Capai 86 Persen', 'perbaikan-jalan-seberang-ulu-satu', 'Fasilitas', 'Sebanyak 12 ruas jalan lingkungan masuk tahap akhir pengaspalan.', '<p>Perbaikan jalan lingkungan dilakukan berdasarkan laporan warga dan survei lapangan.</p>', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', null, 12300000000, 10580000000, 86, 'ongoing', '2026-04-28 10:30:00+00', (select id from admin_user), 'Dinas Perkimtan Kota Palembang'),
  ('Rencana Penataan Taman Kambang Iwak Masuk Konsultasi Publik', 'penataan-taman-kambang-iwak', 'Pengumuman', 'Warga dapat memberi masukan terkait taman dan fasilitas publik.', '<p>Penataan Taman Kambang Iwak masih berada pada tahap konsultasi publik.</p>', 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=1200&q=80', null, 7600000000, 820000000, 11, 'planning', '2026-04-22 03:00:00+00', (select id from admin_user), 'Bappeda Kota Palembang'),
  ('Peningkatan Penerangan Jalan Umum di Kawasan Pasar 16 Ilir Selesai', 'pju-pasar-16-ilir-selesai', 'Anggaran', 'Pemasangan lampu hemat energi rampung dan mulai beroperasi.', '<p>Pekerjaan PJU di Pasar 16 Ilir telah selesai dan masuk masa pemeliharaan.</p>', 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?auto=format&fit=crop&w=1200&q=80', null, 4800000000, 4680000000, 98, 'done', '2026-04-18 12:00:00+00', (select id from admin_user), 'Dinas Perhubungan Kota Palembang'),
  ('Renovasi Gedung Layanan Terpadu Kecamatan Ilir Barat II Berjalan', 'renovasi-gedung-layanan-ilir-barat-dua', 'Pembangunan', 'Renovasi gedung layanan diarahkan untuk mempercepat pelayanan administrasi.', '<p>Renovasi mencakup ruang tunggu, loket pelayanan, sistem antrean, dan akses ramah difabel.</p>', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', null, 9200000000, 5100000000, 55, 'ongoing', '2026-04-12 07:30:00+00', (select id from admin_user), 'Sekretariat Daerah Kota Palembang')
  on conflict (slug) do nothing
  returning id, slug
)
insert into comments (post_id, anonymous_name, content_raw, content_filtered, is_filtered, is_pinned, admin_reply)
select p.id, c.anonymous_name, c.content_raw, c.content_filtered, false, c.is_pinned, c.admin_reply
from posts p
join (
  values
  ('revitalisasi-trotoar-drainase-sudirman', 'Warga Palembang #1428', 'Drainase dekat halte masih sering mampet saat hujan deras.', 'Drainase dekat halte masih sering mampet saat hujan deras.', true, 'Tim PUPR sudah menjadwalkan pengecekan tambahan minggu ini.'),
  ('revitalisasi-trotoar-drainase-sudirman', 'Warga Palembang #7321', 'Tolong perhatikan akses kursi roda di depan toko lama.', 'Tolong perhatikan akses kursi roda di depan toko lama.', false, null),
  ('perbaikan-jalan-seberang-ulu-satu', 'Warga Palembang #2219', 'Jalan dekat sekolah sudah jauh lebih baik.', 'Jalan dekat sekolah sudah jauh lebih baik.', false, null),
  ('penataan-taman-kambang-iwak', 'Warga Palembang #1190', 'Taman butuh lampu dan toilet yang bersih.', 'Taman butuh lampu dan toilet yang bersih.', true, null),
  ('pju-pasar-16-ilir-selesai', 'Warga Palembang #6720', 'Lampu baru membantu pedagang pulang malam.', 'Lampu baru membantu pedagang pulang malam.', false, null),
  ('renovasi-gedung-layanan-ilir-barat-dua', 'Warga Palembang #4381', 'Mohon antrean layanan dibuat jelas.', 'Mohon antrean layanan dibuat jelas.', false, null)
) as c(slug, anonymous_name, content_raw, content_filtered, is_pinned, admin_reply) on c.slug = p.slug;

insert into storage.buckets (id, name, public)
values ('palembang-media', 'palembang-media', true)
on conflict (id) do nothing;
