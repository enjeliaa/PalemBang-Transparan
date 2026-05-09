import { NextResponse } from "next/server";
import type { Post } from "@/types";
import { createLocalPost } from "@/lib/local-store";
import { isAdmin } from "@/lib/permissions";
import { hasSupabaseAdminEnv, supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Hanya admin pemerintah yang boleh membuat postingan." }, { status: 403 });
  }

  if (process.env.VERCEL === "1" && process.env.CONTENT_SOURCE !== "supabase") {
    return NextResponse.json(
      {
        error:
          "Admin di Vercel sedang memakai mode konten lokal. Buat/edit postingan dari localhost lalu commit/push, atau set CONTENT_SOURCE=supabase dan konfigurasi Supabase.",
      },
      { status: 500 },
    );
  }

  const body = await request.json();
  const payload: Omit<Post, "id"> = {
    title: body.title,
    slug: body.slug,
    category: body.category,
    excerpt: body.excerpt,
    content_html: body.content_html,
    thumbnail_url: body.thumbnail_url,
    video_url: body.video_url || undefined,
    budget_total: body.budget_total,
    budget_realized: body.budget_realized,
    progress_percent: body.progress_percent,
    status: body.status,
    published_at: new Date().toISOString(),
    author_name: body.author_name ?? "Pemerintah Kota Palembang",
  };

  if (hasSupabaseAdminEnv && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from("posts").insert(payload).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  if (process.env.VERCEL === "1") {
    return NextResponse.json(
      {
        error:
          "Mode deploy saat ini memakai data dari kode. Postingan tidak bisa disimpan permanen dari Vercel. Edit di localhost lalu commit/push, atau aktifkan Supabase untuk konten.",
      },
      { status: 500 },
    );
  }

  const post = await createLocalPost(payload);
  return NextResponse.json({ ...post, demo: true });
}
