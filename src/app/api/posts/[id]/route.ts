import { NextResponse } from "next/server";
import { deleteLocalPost, updateLocalPost } from "@/lib/local-store";
import { isAdmin } from "@/lib/permissions";
import { hasSupabaseAdminEnv, supabaseAdmin } from "@/lib/supabase-admin";
import { normalizeVideoUrl } from "@/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Props) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Hanya admin pemerintah yang boleh mengedit postingan." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  if ("video_url" in body) body.video_url = normalizeVideoUrl(body.video_url);

  if (hasSupabaseAdminEnv && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("posts")
      .update(body)
      .eq("id", id)
      .select("*");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (data?.[0]) return NextResponse.json(data[0]);

    const { data: upsertedData, error: upsertError } = await supabaseAdmin
      .from("posts")
      .upsert(body, { onConflict: "slug" })
      .select("*");

    if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 });
    return NextResponse.json(upsertedData?.[0] ?? body);
  }

  if (process.env.VERCEL === "1") {
    return NextResponse.json(
      {
        error:
          "Supabase belum siap untuk mengedit postingan dari Vercel. Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di Vercel.",
      },
      { status: 500 },
    );
  }

  const post = await updateLocalPost(id, body);
  if (!post) return NextResponse.json({ error: "Postingan tidak ditemukan." }, { status: 404 });
  return NextResponse.json({ ...post, demo: true });
}

export async function DELETE(_request: Request, { params }: Props) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Hanya admin pemerintah yang boleh menghapus postingan." }, { status: 403 });
  }

  const { id } = await params;

  if (hasSupabaseAdminEnv && supabaseAdmin) {
    const { error } = await supabaseAdmin.from("posts").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id, deleted: true });
  }

  if (process.env.VERCEL === "1") {
    return NextResponse.json(
      {
        error:
          "Supabase belum siap untuk menghapus postingan dari Vercel. Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di Vercel.",
      },
      { status: 500 },
    );
  }

  await deleteLocalPost(id);
  return NextResponse.json({ id, deleted: true });
}

export async function POST(request: Request, props: Props) {
  const url = new URL(request.url);
  if (url.searchParams.get("_method") === "DELETE") {
    return DELETE(request, props);
  }

  return NextResponse.json({ error: "Method tidak didukung." }, { status: 405 });
}
