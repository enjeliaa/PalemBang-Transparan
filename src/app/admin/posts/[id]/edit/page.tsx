import { AdminPostForm } from "@/components/AdminPostForm";
import { getPosts } from "@/lib/data";
import { isAdmin } from "@/lib/permissions";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata = { title: "Edit Postingan - PalemBang" };

export default async function EditPostPage({ params }: Props) {
  if (!(await isAdmin())) redirect("/admin/login");

  const { id } = await params;
  const posts = await getPosts();
  const post = posts.find((item) => item.id === id);

  if (!post) redirect("/admin/posts");

  return <AdminPostForm mode="edit" post={post} />;
}
