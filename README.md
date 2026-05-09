# PalemBang

PalemBang adalah website transparansi pembangunan Kota Palembang. Website ini menampilkan informasi proyek, progres anggaran, komentar anonim warga, dan dashboard admin untuk pengelolaan konten.

Tagline: **Palembang Terbuka, Palembang Maju**

## Fitur

- Halaman publik berisi hero, breaking news, grid postingan, dan detail artikel.
- Widget anggaran untuk menampilkan alokasi, realisasi, dan progres proyek.
- Komentar anonim warga tanpa login.
- Sensor otomatis untuk kata terlarang.
- Dashboard admin untuk membuat, mengedit, menghapus postingan, dan upload media.
- Analitik keyword dari komentar warga.
- Integrasi Supabase untuk database dan storage.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- NextAuth
- TipTap
- Recharts
- Vercel

## Menjalankan Project

Install dependency:

```bash
npm install
```

Buat file `.env.local`:

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

Jalankan development server:

```bash
npm run dev
```

Buka:

```text
http://localhost:3000
```

## Admin

Halaman login admin:

```text
/admin/login
```

Akun demo:

```text
Email: admin@palembang.go.id
Password: PalemBang#2026
```

## Supabase

Jalankan file SQL berikut di Supabase SQL Editor:

```text
supabase/schema-and-seed.sql
```

File tersebut membuat tabel, policy, bucket storage, dan data awal.

## Deploy

Project ini dapat dideploy ke Vercel. Pastikan semua environment variables sudah diisi di Vercel sebelum deploy.
Gunakan URL project Supabase untuk `NEXT_PUBLIC_SUPABASE_URL`, misalnya `https://your-project-ref.supabase.co`, bukan URL REST API yang berakhiran `/rest/v1`.

Di production, data admin disimpan ke Supabase. Jika `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, atau `SUPABASE_SERVICE_ROLE_KEY` belum benar di Vercel, halaman akan memakai data demo dan perubahan admin tidak akan tersimpan.

Secara default, konten publik memakai data yang tersimpan di kode (`src/lib/demo-data.ts`) agar hasil deploy sama dengan perubahan lokal. Jika ingin membaca konten dari Supabase, set `CONTENT_SOURCE=supabase` di Vercel.

```bash
git add .
git commit -m "update project"
git push
```

Vercel akan melakukan deploy otomatis setelah push ke GitHub.
