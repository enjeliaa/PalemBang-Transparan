import { NextResponse } from "next/server";
import { filterContent } from "@/lib/contentFilter";
import { createLocalComment } from "@/lib/local-store";
import { hasSupabaseEnv, supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json();
  const postId = String(body.postId ?? "");
  const anonymousName = String(body.anonymousName ?? "");
  const content = String(body.content ?? "").trim();

  if (!postId || !anonymousName || !content) {
    return NextResponse.json({ error: "Data komentar belum lengkap." }, { status: 400 });
  }

  const filtered = filterContent(content);
  const payload = {
    post_id: postId,
    anonymous_name: anonymousName,
    content_raw: content,
    content_filtered: filtered.filtered,
    is_filtered: filtered.isFiltered,
    is_pinned: false,
    is_deleted: false,
  };

  if (hasSupabaseEnv && supabase) {
    const { error } = await supabase.from("comments").insert(payload);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ...payload, created_at: new Date().toISOString() });
  }

  const comment = await createLocalComment(payload);
  return NextResponse.json(comment);
}
