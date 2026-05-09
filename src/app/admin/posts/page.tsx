import Link from "next/link";
import { Edit, Plus } from "lucide-react";
import { DeletePostButton } from "@/components/DeletePostButton";
import { getPosts } from "@/lib/data";
import { isAdmin } from "@/lib/permissions";
import { formatDate, formatRupiah, statusClass, statusLabel } from "@/lib/utils";
import { redirect } from "next/navigation";

export const metadata = { title: "Manajemen Postingan - PalemBang" };

export default async function AdminPostsPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const posts = await getPosts();

  return (
    <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase text-[#C8102E]">CRUD Admin</p>
          <h2 className="font-serif text-3xl font-black">Manajemen Postingan</h2>
        </div>
        <Link href="/admin/posts/new" className="inline-flex items-center gap-2 rounded bg-[#C8102E] px-4 py-2 font-black text-white">
          <Plus size={18} /> Buat Postingan
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-zinc-100 text-xs uppercase text-zinc-500">
            <tr>
              <th className="p-3">Judul</th>
              <th className="p-3">Kategori</th>
              <th className="p-3">Status</th>
              <th className="p-3">Anggaran</th>
              <th className="p-3">Tanggal</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="p-3 font-black text-[#1A1A2E]">{post.title}</td>
                <td className="p-3">{post.category}</td>
                <td className="p-3"><span className={`rounded px-2 py-1 text-xs font-black ${statusClass(post.status)}`}>{statusLabel(post.status)}</span></td>
                <td className="p-3">{formatRupiah(post.budget_realized)} / {post.progress_percent}%</td>
                <td className="p-3">{formatDate(post.published_at)}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/posts/${post.id}/edit`} className="grid size-9 place-items-center rounded border border-zinc-200 text-blue-600" title="Edit">
                      <Edit size={16} />
                    </Link>
                    <DeletePostButton postId={post.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
