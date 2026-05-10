import { NextResponse } from "next/server";
import { deleteLocalComment, getLocalPosts, updateLocalComment } from "@/lib/local-store";
import { isAdmin } from "@/lib/permissions";
import { hasSupabaseAdminEnv, supabaseAdmin } from "@/lib/supabase-admin";

type Props = {
  params: Promise<{ id: string }>;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function resolveSupabasePostId(postId?: string) {
  if (!postId || !supabaseAdmin) return null;
  if (isUuid(postId)) return postId;

  const localPosts = await getLocalPosts();
  const localPost = localPosts.find((post) => post.id === postId);
  if (!localPost) return null;

  const { data } = await supabaseAdmin
    .from("posts")
    .select("id")
    .eq("slug", localPost.slug)
    .maybeSingle();

  return data?.id ?? null;
}

async function upsertSupabaseComment(body: Record<string, unknown>, payload: Record<string, unknown>) {
  if (!supabaseAdmin) return null;

  const postId = await resolveSupabasePostId(String(body.post_id ?? ""));
  if (!postId) return null;

  const anonymousName = String(body.anonymous_name ?? "");
  const contentRaw = String(body.content_raw ?? "");
  const contentFiltered = String(body.content_filtered ?? contentRaw);

  const { data: existing, error: findError } = await supabaseAdmin
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .eq("anonymous_name", anonymousName)
    .eq("content_raw", contentRaw)
    .limit(1);

  if (findError) throw new Error(findError.message);

  if (existing?.[0]) {
    const { data, error } = await supabaseAdmin
      .from("comments")
      .update(payload)
      .eq("id", existing[0].id)
      .select("*");

    if (error) throw new Error(error.message);
    return data?.[0] ?? null;
  }

  const { data, error } = await supabaseAdmin
    .from("comments")
    .insert({
      post_id: postId,
      anonymous_name: anonymousName,
      content_raw: contentRaw,
      content_filtered: contentFiltered,
      is_filtered: Boolean(body.is_filtered),
      created_at: body.created_at,
      ...payload,
    })
    .select("*");

  if (error) throw new Error(error.message);
  return data?.[0] ?? null;
}

export async function PATCH(request: Request, { params }: Props) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Hanya admin pemerintah yang boleh mengelola komentar." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const payload = {
    admin_reply: body.admin_reply ?? null,
    is_pinned: Boolean(body.is_pinned),
    is_deleted: Boolean(body.is_deleted),
  };

  if (hasSupabaseAdminEnv && supabaseAdmin) {
    try {
      if (isUuid(id)) {
        const { data, error } = await supabaseAdmin
          .from("comments")
          .update(payload)
          .eq("id", id)
          .select("*");

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        if (data?.[0]) return NextResponse.json(data[0]);
      }

      const comment = await upsertSupabaseComment(body, payload);
      if (comment) return NextResponse.json(comment);
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Komentar gagal diperbarui." }, { status: 500 });
    }
  }

  if (process.env.VERCEL === "1") {
    return NextResponse.json({
      ...body,
      ...payload,
      id,
      transient: true,
      warning: "Komentar bawaan demo hanya berubah di tampilan saat ini. Komentar asli dari warga akan tersimpan di Supabase.",
    });
  }

  const comment = await updateLocalComment(id, payload);
  if (!comment) return NextResponse.json({ error: "Komentar tidak ditemukan." }, { status: 404 });
  return NextResponse.json(comment);
}

export async function DELETE(request: Request, { params }: Props) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Hanya admin pemerintah yang boleh menghapus komentar." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (hasSupabaseAdminEnv && supabaseAdmin) {
    try {
      if (isUuid(id)) {
        const { data, error } = await supabaseAdmin
          .from("comments")
          .update({ is_deleted: true })
          .eq("id", id)
          .select("*");

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        if (data?.[0]) return NextResponse.json({ id, deleted: true });
      }

      const comment = await upsertSupabaseComment(body, { is_deleted: true });
      if (comment) return NextResponse.json({ id, deleted: true });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Komentar gagal dihapus." }, { status: 500 });
    }
  }

  if (process.env.VERCEL === "1") {
    return NextResponse.json({
      id,
      deleted: true,
      transient: true,
      warning: "Komentar bawaan demo hanya terhapus di tampilan saat ini. Komentar asli dari warga akan terhapus di Supabase.",
    });
  }

  await deleteLocalComment(id);
  return NextResponse.json({ id, deleted: true });
}
