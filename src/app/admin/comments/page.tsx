import { Pin, ShieldCheck, Trash2 } from "lucide-react";
import { getComments, getPosts } from "@/lib/data";
import { relativeTime } from "@/lib/utils";
import { isAdmin } from "@/lib/permissions";
import { redirect } from "next/navigation";

export const metadata = { title: "Manajemen Komentar - PalemBang" };

export default async function AdminCommentsPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const [comments, posts] = await Promise.all([getComments(), getPosts()]);
  const postTitle = new Map(posts.map((post) => [post.id, post.title]));

  return (
    <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-black uppercase text-[#C8102E]">Moderasi</p>
        <h2 className="font-serif text-3xl font-black">Semua Komentar Warga</h2>
      </div>
      <div className="space-y-4">
        {comments.map((comment) => (
          <article key={comment.id} className="rounded border border-zinc-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-black text-[#1A1A2E]">{comment.anonymous_name}</p>
                <p className="mt-1 text-xs text-zinc-500">{postTitle.get(comment.post_id)} · {relativeTime(comment.created_at)}</p>
              </div>
              <div className="flex gap-2">
                <button className="grid size-9 place-items-center rounded border border-zinc-200 text-[#F5A623]" title="Pin komentar"><Pin size={16} /></button>
                <button className="grid size-9 place-items-center rounded border border-zinc-200 text-green-600" title="Balas resmi"><ShieldCheck size={16} /></button>
                <button className="grid size-9 place-items-center rounded border border-zinc-200 text-red-600" title="Hapus komentar"><Trash2 size={16} /></button>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-700">{comment.content_filtered}</p>
            {comment.is_filtered && <p className="mt-2 rounded bg-yellow-100 px-3 py-2 text-xs font-black text-yellow-800">Komentar telah disaring oleh sistem.</p>}
            <textarea className="mt-3 min-h-20 w-full rounded border border-zinc-300 p-3 text-sm" placeholder="Tulis jawaban resmi pemerintah..." defaultValue={comment.admin_reply ?? ""} />
          </article>
        ))}
      </div>
    </section>
  );
}
