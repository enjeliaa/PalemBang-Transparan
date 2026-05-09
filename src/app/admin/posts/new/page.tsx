import { AdminPostForm } from "@/components/AdminPostForm";
import { isAdmin } from "@/lib/permissions";
import { redirect } from "next/navigation";

export const metadata = { title: "Buat Postingan - PalemBang" };

export default async function NewPostPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  return <AdminPostForm mode="create" />;
}
