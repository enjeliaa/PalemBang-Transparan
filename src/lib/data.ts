import { getLocalBudgetItems, getLocalComments, getLocalPosts } from "@/lib/local-store";
import { hasSupabaseEnv, supabase } from "@/lib/supabase";
import type { BudgetItem, Comment, Post } from "@/types";

function sortPosts(posts: Post[]) {
  return posts.sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
  );
}

function getLatestPostTime(posts: Post[]) {
  return Math.max(...posts.map((post) => new Date(post.published_at).getTime()), 0);
}

function shouldUseSupabasePost(post: Post, localPosts: Post[]) {
  const localSlugs = new Set(localPosts.map((localPost) => localPost.slug));
  return localSlugs.has(post.slug) || new Date(post.published_at).getTime() > getLatestPostTime(localPosts);
}

function mergePosts(localPosts: Post[], supabasePosts: Post[]) {
  const merged = new Map(localPosts.map((post) => [post.slug, post]));

  for (const post of supabasePosts) {
    if (shouldUseSupabasePost(post, localPosts)) {
      merged.set(post.slug, post);
    }
  }

  return sortPosts([...merged.values()]);
}

function sortComments(comments: Comment[]) {
  return comments.sort(
    (a, b) =>
      Number(b.is_pinned) - Number(a.is_pinned) ||
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

function mergeComments(localComments: Comment[], supabaseComments: Comment[]) {
  const merged = new Map(localComments.map((comment) => [comment.id, comment]));

  for (const comment of supabaseComments) {
    merged.set(comment.id, comment);
  }

  return sortComments([...merged.values()]);
}

export async function getPosts(): Promise<Post[]> {
  const localPosts = await getLocalPosts();
  if (!hasSupabaseEnv || !supabase) return localPosts;

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false });

  if (error || !data?.length) return localPosts;
  return mergePosts(localPosts, data as Post[]);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const localPosts = await getLocalPosts();
  const fallback = localPosts.find((post) => post.slug === slug) ?? null;
  if (!hasSupabaseEnv || !supabase) return fallback;

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return fallback;
  const post = data as Post;
  return shouldUseSupabasePost(post, localPosts) ? post : fallback;
}

export async function getCommentsForPost(post: Post): Promise<Comment[]> {
  const localPosts = await getLocalPosts();
  const localPost = localPosts.find((item) => item.slug === post.slug);
  const postIds = new Set([post.id, localPost?.id].filter(Boolean) as string[]);
  const fallback = mergeComments(
    [],
    (await getLocalComments()).filter((comment) => postIds.has(comment.post_id)),
  );

  if (!hasSupabaseEnv || !supabase) return fallback;

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .in("post_id", [...postIds])
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data?.length) return fallback;
  return mergeComments(fallback, data as Comment[]).filter((comment) => !comment.is_deleted);
}

export async function getBudgetItems(postId: string): Promise<BudgetItem[]> {
  const fallback = await getLocalBudgetItems(postId);
  if (!hasSupabaseEnv || !supabase) return fallback;

  const { data, error } = await supabase
    .from("budget_items")
    .select("*")
    .eq("post_id", postId);

  if (error || !data?.length) return fallback;
  return data as BudgetItem[];
}

export async function getComments(postId?: string): Promise<Comment[]> {
  const fallback = await getLocalComments(postId);

  if (!hasSupabaseEnv || !supabase) return fallback;

  let query = supabase
    .from("comments")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (postId) query = query.eq("post_id", postId);

  const { data, error } = await query;
  if (error || !data?.length) return fallback;
  return mergeComments(fallback, data as Comment[]).filter((comment) => !comment.is_deleted);
}

export async function getDashboardStats() {
  const posts = await getPosts();
  const comments = await getComments();
  const now = new Date();

  return {
    totalPosts: posts.length,
    totalComments: comments.length,
    postsThisMonth: posts.filter((post) => {
      const date = new Date(post.published_at);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
    commentsToday: comments.filter((comment) => {
      const date = new Date(comment.created_at);
      return date.toDateString() === now.toDateString();
    }).length,
  };
}
