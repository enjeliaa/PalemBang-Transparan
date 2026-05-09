export type ProjectStatus = "planning" | "ongoing" | "done";

export type Post = {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content_html: string;
  thumbnail_url: string;
  video_url?: string;
  budget_total: number;
  budget_realized: number;
  progress_percent: number;
  status: ProjectStatus;
  published_at: string;
  author_name: string;
};

export type BudgetItem = {
  id: string;
  post_id: string;
  item_name: string;
  allocated_amount: number;
  realized_amount: number;
  description: string;
};

export type Comment = {
  id: string;
  post_id: string;
  anonymous_name: string;
  content_raw: string;
  content_filtered: string;
  is_filtered: boolean;
  is_pinned: boolean;
  is_deleted: boolean;
  admin_reply?: string;
  created_at: string;
};
