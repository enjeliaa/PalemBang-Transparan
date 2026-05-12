import { NextResponse } from "next/server";
import { filterContent } from "@/lib/contentFilter";
import { createLocalComment, getLocalPosts } from "@/lib/local-store";
import { getComments } from "@/lib/data";
import { hasSupabaseEnv, supabase } from "@/lib/supabase";
import { hasSupabaseAdminEnv, supabaseAdmin } from "@/lib/supabase-admin";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(value);
}

async function resolveSupabasePostId(postId: string, postSlug: string) {
  const client = supabaseAdmin ?? supabase;
  if (!client) return null;

  let slug = postSlug;
  if (!slug) {
    const localPosts = await getLocalPosts();
    slug = localPosts.find((post) => post.id === postId)?.slug ?? "";
  }

  if (!slug) return null;

  const { data, error } = await client
    .from("posts")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (data?.id) return data.id as string;
  return postSlug ? null : isUuid(postId) ? postId : null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const anonymousName = url.searchParams.get("anonymousName")?.trim();

  if (!anonymousName) {
    return NextResponse.json({ error: "Nama anonim belum tersedia." }, { status: 400 });
  }

  const comments = await getComments();
  const replies = comments.filter(
    (comment) => comment.anonymous_name === anonymousName && Boolean(comment.admin_reply) && !comment.is_deleted,
  );

  return NextResponse.json(replies);
}

export async function POST(request: Request) {
  const body = await request.json();
  const postId = String(body.postId ?? "");
  const postSlug = String(body.postSlug ?? "");
  const anonymousName = String(body.anonymousName ?? "");
  const content = String(body.content ?? "").trim();

  if (!postId || !anonymousName || !content) {
    return NextResponse.json({ error: "Data komentar belum lengkap." }, { status: 400 });
  }

  const filtered = filterContent(content);
  let postIdForStorage: string | null = isUuid(postId) ? postId : null;

  if (hasSupabaseAdminEnv || hasSupabaseEnv) {
    try {
      postIdForStorage = await resolveSupabasePostId(postId, postSlug);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Postingan Supabase gagal dicek." },
        { status: 500 },
      );
    }
  }

  const payload = {
    post_id: postIdForStorage,
    post_slug: postSlug || null,
    anonymous_name: anonymousName,
    content_raw: content,
    content_filtered: filtered.filtered,
    is_filtered: filtered.isFiltered,
    is_pinned: false,
    is_deleted: false,
  };

  const client = supabaseAdmin ?? supabase;
  if (client) {
    const { data, error } = await client.from("comments").insert(payload).select("*");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data?.[0] ?? { ...payload, created_at: new Date().toISOString() });
  }

  if (process.env.VERCEL === "1") {
    return NextResponse.json(
      {
        error:
          "Komentar belum bisa disimpan permanen karena Supabase belum terhubung di Vercel. Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di Environment Variables.",
      },
      { status: 500 },
    );
  }

  const comment = await createLocalComment(payload);
  return NextResponse.json(comment);
}
