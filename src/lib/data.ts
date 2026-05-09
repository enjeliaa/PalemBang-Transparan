import { getLocalBudgetItems, getLocalComments, getLocalPosts } from "@/lib/local-store";
import { hasSupabaseEnv, supabase } from "@/lib/supabase";
import type { BudgetItem, Comment, Post } from "@/types";

const useSupabaseContent = process.env.CONTENT_SOURCE === "supabase";

export async function getPosts(): Promise<Post[]> {
  if (!useSupabaseContent || !hasSupabaseEnv || !supabase) return getLocalPosts();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false });

  if (error || !data?.length) return getLocalPosts();
  return data as Post[];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const localPosts = await getLocalPosts();
  const fallback = localPosts.find((post) => post.slug === slug) ?? null;
  if (!useSupabaseContent || !hasSupabaseEnv || !supabase) return fallback;

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return fallback;
  return data as Post;
}

export async function getBudgetItems(postId: string): Promise<BudgetItem[]> {
  const fallback = await getLocalBudgetItems(postId);
  if (!useSupabaseContent || !hasSupabaseEnv || !supabase) return fallback;

  const { data, error } = await supabase
    .from("budget_items")
    .select("*")
    .eq("post_id", postId);

  if (error || !data?.length) return fallback;
  return data as BudgetItem[];
}

export async function getComments(postId?: string): Promise<Comment[]> {
  const fallback = await getLocalComments(postId);

  if (!useSupabaseContent || !hasSupabaseEnv || !supabase) return fallback;

  let query = supabase
    .from("comments")
    .select("*")
    .eq("is_deleted", false)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (postId) query = query.eq("post_id", postId);

  const { data, error } = await query;
  if (error || !data?.length) return fallback;
  return data as Comment[];
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
