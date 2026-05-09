import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { demoBudgetItems, demoComments, demoPosts } from "@/lib/demo-data";
import type { BudgetItem, Comment, Post } from "@/types";

type LocalDatabase = {
  posts: Post[];
  budgetItems: BudgetItem[];
  comments: Comment[];
};

const dataDirectory = path.join(process.cwd(), "data");
const databasePath = path.join(dataDirectory, "local-db.json");

async function ensureLocalDatabase() {
  await mkdir(dataDirectory, { recursive: true });

  try {
    const content = await readFile(databasePath, "utf8");
    const database = JSON.parse(content) as LocalDatabase;
    const comments = database.comments.filter((comment) => !comment.id.startsWith("c-issue-"));

    if (comments.length !== database.comments.length) {
      await writeFile(databasePath, JSON.stringify({ ...database, comments }, null, 2), "utf8");
    }
  } catch {
    const initialData: LocalDatabase = {
      posts: demoPosts,
      budgetItems: demoBudgetItems,
      comments: demoComments,
    };

    await writeFile(databasePath, JSON.stringify(initialData, null, 2), "utf8");
  }
}

export async function readLocalDatabase(): Promise<LocalDatabase> {
  await ensureLocalDatabase();
  const content = await readFile(databasePath, "utf8");
  return JSON.parse(content) as LocalDatabase;
}

async function writeLocalDatabase(database: LocalDatabase) {
  await ensureLocalDatabase();
  await writeFile(databasePath, JSON.stringify(database, null, 2), "utf8");
}

export async function getLocalPosts() {
  const database = await readLocalDatabase();
  return database.posts.sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
  );
}

export async function getLocalBudgetItems(postId: string) {
  const database = await readLocalDatabase();
  return database.budgetItems.filter((item) => item.post_id === postId);
}

export async function getLocalComments(postId?: string) {
  const database = await readLocalDatabase();
  return database.comments.filter((comment) => {
    if (comment.is_deleted) return false;
    return postId ? comment.post_id === postId : true;
  });
}

export async function createLocalComment(payload: Omit<Comment, "id" | "created_at">) {
  const database = await readLocalDatabase();
  const comment: Comment = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    ...payload,
  };

  database.comments.unshift(comment);
  await writeLocalDatabase(database);
  return comment;
}

export async function createLocalPost(payload: Omit<Post, "id">) {
  const database = await readLocalDatabase();
  const post: Post = {
    id: crypto.randomUUID(),
    ...payload,
  };

  database.posts.unshift(post);
  await writeLocalDatabase(database);
  return post;
}

export async function updateLocalPost(id: string, payload: Partial<Post>) {
  const database = await readLocalDatabase();
  const index = database.posts.findIndex((post) => post.id === id);

  if (index === -1) return null;

  database.posts[index] = {
    ...database.posts[index],
    ...payload,
    id,
  };

  await writeLocalDatabase(database);
  return database.posts[index];
}

export async function deleteLocalPost(id: string) {
  const database = await readLocalDatabase();
  database.posts = database.posts.filter((post) => post.id !== id);
  database.budgetItems = database.budgetItems.filter((item) => item.post_id !== id);
  database.comments = database.comments.filter((comment) => comment.post_id !== id);
  await writeLocalDatabase(database);
}
