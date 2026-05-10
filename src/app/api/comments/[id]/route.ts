import { NextResponse } from "next/server";
import { deleteLocalComment, updateLocalComment } from "@/lib/local-store";
import { isAdmin } from "@/lib/permissions";
import { hasSupabaseAdminEnv, supabaseAdmin } from "@/lib/supabase-admin";

type Props = {
  params: Promise<{ id: string }>;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
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

  if (hasSupabaseAdminEnv && supabaseAdmin && isUuid(id)) {
    const { data, error } = await supabaseAdmin
      .from("comments")
      .update(payload)
      .eq("id", id)
      .select("*");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (data?.[0]) return NextResponse.json(data[0]);
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

  if (hasSupabaseAdminEnv && supabaseAdmin && isUuid(id)) {
    const { data, error } = await supabaseAdmin
      .from("comments")
      .update({ is_deleted: true })
      .eq("id", id)
      .select("*");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (data?.[0]) return NextResponse.json({ id, deleted: true });
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
