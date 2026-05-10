"use client";

import { useMemo, useState } from "react";
import { Pin, Save, ShieldCheck, Trash2 } from "lucide-react";
import type { Comment, Post } from "@/types";
import { relativeTime } from "@/lib/utils";

type Props = {
  initialComments: Comment[];
  posts: Post[];
};

export function AdminCommentsManager({ initialComments, posts }: Props) {
  const [comments, setComments] = useState(initialComments);
  const [draftReplies, setDraftReplies] = useState<Record<string, string>>(
    Object.fromEntries(initialComments.map((comment) => [comment.id, comment.admin_reply ?? ""])),
  );
  const [message, setMessage] = useState("");
  const [loadingId, setLoadingId] = useState("");

  const postTitle = useMemo(() => new Map(posts.map((post) => [post.id, post.title])), [posts]);

  async function readError(response: Response, fallback: string) {
    try {
      const data = await response.json();
      return typeof data.error === "string" ? data.error : fallback;
    } catch {
      return fallback;
    }
  }

  async function updateComment(comment: Comment, payload: Partial<Comment>, successMessage: string) {
    setLoadingId(comment.id);
    setMessage("");

    const nextComment = { ...comment, ...payload };
    const response = await fetch(`/api/comments/${comment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(nextComment),
    });

    setLoadingId("");
    if (!response.ok) {
      setMessage(await readError(response, "Komentar gagal diperbarui."));
      return;
    }

    const data = await response.json();
    setComments((current) => current.map((item) => (item.id === comment.id ? { ...nextComment, ...data } : item)));
    setMessage(successMessage);
  }

  async function deleteComment(comment: Comment) {
    const confirmed = window.confirm("Hapus komentar ini?");
    if (!confirmed) return;

    setLoadingId(comment.id);
    setMessage("");

    const response = await fetch(`/api/comments/${comment.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(comment),
    });

    setLoadingId("");
    if (!response.ok) {
      setMessage(await readError(response, "Komentar gagal dihapus."));
      return;
    }

    setComments((current) => current.filter((item) => item.id !== comment.id));
    setMessage("Komentar berhasil dihapus.");
  }

  return (
    <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-black uppercase text-[#C8102E]">Moderasi</p>
        <h2 className="font-serif text-3xl font-black">Semua Komentar Warga</h2>
        <p className="mt-2 text-sm font-bold text-zinc-500">{comments.length} komentar ditampilkan.</p>
        {message && <p className="mt-3 rounded bg-zinc-50 p-3 text-sm font-bold text-zinc-700">{message}</p>}
      </div>
      <div className="space-y-4">
        {comments.map((comment) => (
          <article key={comment.id} className="rounded border border-zinc-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-black text-[#1A1A2E]">{comment.anonymous_name}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {postTitle.get(comment.post_id) ?? "Postingan terkait"} - {relativeTime(comment.created_at)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={loadingId === comment.id}
                  onClick={() => updateComment(comment, { is_pinned: !comment.is_pinned }, comment.is_pinned ? "Komentar dilepas dari pin." : "Komentar berhasil dipin.")}
                  className={`grid size-9 place-items-center rounded border border-zinc-200 ${comment.is_pinned ? "bg-[#F5A623] text-[#1A1A2E]" : "text-[#F5A623]"}`}
                  title={comment.is_pinned ? "Lepas pin komentar" : "Pin komentar"}
                >
                  <Pin size={16} />
                </button>
                <button
                  type="button"
                  disabled={loadingId === comment.id}
                  onClick={() => updateComment(comment, { admin_reply: draftReplies[comment.id] ?? "" }, "Jawaban resmi berhasil disimpan.")}
                  className="grid size-9 place-items-center rounded border border-zinc-200 text-green-600"
                  title="Simpan jawaban resmi"
                >
                  <Save size={16} />
                </button>
                <button
                  type="button"
                  disabled={loadingId === comment.id}
                  onClick={() => deleteComment(comment)}
                  className="grid size-9 place-items-center rounded border border-zinc-200 text-red-600"
                  title="Hapus komentar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-700">{comment.content_filtered}</p>
            {comment.is_filtered && <p className="mt-2 rounded bg-yellow-100 px-3 py-2 text-xs font-black text-yellow-800">Komentar telah disaring oleh sistem.</p>}
            <label className="mt-3 flex items-center gap-2 text-xs font-black uppercase text-green-700">
              <ShieldCheck size={14} /> Jawaban Resmi Pemerintah
            </label>
            <textarea
              className="mt-2 min-h-20 w-full rounded border border-zinc-300 p-3 text-sm"
              placeholder="Tulis jawaban resmi pemerintah..."
              value={draftReplies[comment.id] ?? ""}
              onChange={(event) => setDraftReplies((current) => ({ ...current, [comment.id]: event.target.value }))}
            />
          </article>
        ))}
      </div>
    </section>
  );
}
