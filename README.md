# PalemBang

Tagline: **Palembang Terbuka, Palembang Maju**

PalemBang adalah portal transparansi Pemerintah Kota Palembang untuk mempublikasikan progress pembangunan fasilitas publik, realisasi APBD, dan aspirasi warga secara anonim.

## Fitur

- Hero video Kota Palembang dengan CTA.
- Navbar sticky responsif dan breaking news ticker.
- Grid postingan ala portal berita.
- Detail artikel dengan hero image, video embed, status proyek, dan widget anggaran.
- Komentar anonim tanpa login, username konsisten via localStorage.
- Filter kata terlarang Bahasa Indonesia dengan sensor otomatis.
- Admin dashboard, form postingan dengan TipTap, moderasi komentar, dan analitik keyword.
- Login admin pemerintah untuk CRUD dan upload media.
- Supabase schema, RLS, seed data, dan storage bucket.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL + Storage
- NextAuth.js
- TipTap
- Recharts
- Vercel

## Setup Lokal

```bash
npm install
cp .env.example .env.local
npm run dev
```

Buka `http://localhost:3000`.

Jika Supabase belum diisi, aplikasi tetap bisa demo CRUD admin secara lokal:

- Postingan tersimpan di `data/local-db.json`.
- Upload foto/video tersimpan di `public/uploads/posts`.
- Untuk production/Vercel, gunakan Supabase karena file lokal Vercel tidak persisten.

Demo admin:

```text
Email: admin@palembang.go.id
Password: PalemBang#2026
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
ADMIN_EMAIL=admin@palembang.go.id
ADMIN_PASSWORD_HASH=
ANTHROPIC_API_KEY=
```

Generate secret:

```bash
openssl rand -base64 32
```

Generate password hash:

```bash
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('PasswordAman#2026',10).then(console.log)"
```

## Supabase

1. Buat project di Supabase.
2. Buka SQL Editor.
3. Jalankan isi file `supabase/schema-and-seed.sql`.
4. Salin Project URL dan anon key ke `.env.local`.
5. Untuk fitur CRUD admin dan upload server-side, salin `service_role key` ke `SUPABASE_SERVICE_ROLE_KEY`. Jangan pernah expose key ini ke frontend.

## Deployment Vercel

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/username/palembang-transparan.git
git push -u origin main
```

Di Vercel:

1. New Project.
2. Import repository `palembang-transparan`.
3. Masukkan environment variables yang sama dengan `.env.local`.
4. Klik Deploy.

Link live akan berbentuk `https://palembang-transparan.vercel.app`.

## Proposal Singkat

Latar belakang: warga kesulitan membaca dokumen APBD dan progress fasilitas publik.  
Solusi: portal berita resmi dengan data anggaran, status pekerjaan, komentar anonim, dan analitik aspirasi.  
Pengembangan berikutnya: integrasi penuh CRUD Supabase, dashboard role editor, notifikasi progres, dan ringkasan AI mingguan berbasis Anthropic Claude.
