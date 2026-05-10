import { AdminCommentsManager } from "@/components/AdminCommentsManager";
import { getComments, getPosts } from "@/lib/data";
import { isAdmin } from "@/lib/permissions";
import { redirect } from "next/navigation";

export const metadata = { title: "Manajemen Komentar - PalemBang" };

export default async function AdminCommentsPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const [comments, posts] = await Promise.all([getComments(), getPosts()]);

  return <AdminCommentsManager initialComments={comments} posts={posts} />;
}
