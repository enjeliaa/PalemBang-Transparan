"use client";

import { FormEvent, useMemo, useState } from "react";
import { Send, ShieldCheck } from "lucide-react";
import type { Comment } from "@/types";
import { filterContent } from "@/lib/contentFilter";
import { relativeTime } from "@/lib/utils";

function getAnonymousName() {
  if (typeof window === "undefined") return "Warga Palembang #0000";
  const existing = localStorage.getItem("palembang_anonymous_name");
  if (existing) return existing;
  const number = Math.floor(1000 + Math.random() * 9000);
  const name = `Warga Palembang #${number}`;
  localStorage.setItem("palembang_anonymous_name", name);
  return name;
}

export function CommentSection({ postId, initialComments }: { postId: string; initialComments: Comment[] }) {
  const [anonymousName] = useState(getAnonymousName);
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);

  const sortedComments = useMemo(
    () => [...comments].sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [comments],
  );

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) return;
    setLoading(true);

    const optimistic = filterContent(content.trim());
    const comment: Comment = {
      id: crypto.randomUUID(),
      post_id: postId,
      anonymous_name: anonymousName,
      content_raw: content.trim(),
      content_filtered: optimistic.filtered,
      is_filtered: optimistic.isFiltered,
      is_pinned: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
    };

    setComments((current) => [comment, ...current]);
    setContent("");

    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, anonymousName, content: comment.content_raw }),
    }).catch(() => null);

    setLoading(false);
  }

  return (
    <section className="mt-10 rounded border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-black uppercase text-[#C8102E]">Aspirasi Warga</p>
        <h2 className="font-serif text-3xl font-black text-[#1A1A2E]">Semua Komentar Anonim</h2>
        <p className="mt-2 text-sm text-zinc-500">Nama kamu otomatis disimpan di perangkat ini sebagai {anonymousName}.</p>
        <p className="mt-1 text-sm font-bold text-[#1A1A2E]">
          {sortedComments.length} komentar ditampilkan untuk postingan ini.
        </p>
      </div>

      <form onSubmit={submitComment} className="mb-6">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="min-h-28 w-full rounded border border-zinc-300 p-3 text-sm outline-none focus:border-[#C8102E] focus:ring-4 focus:ring-red-100"
          placeholder="Tulis aspirasi, kritik, atau masukan untuk proyek ini..."
        />
        <div className="mt-3 flex justify-end">
          <button disabled={loading} className="inline-flex items-center gap-2 rounded bg-[#C8102E] px-4 py-2 font-black text-white disabled:opacity-60">
            <Send size={16} /> Kirim Komentar
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {sortedComments.length > 0 ? sortedComments.slice(0, visibleCount).map((comment) => (
          <article key={comment.id} className={`border-l-4 ${comment.is_pinned ? "border-[#F5A623]" : "border-[#C8102E]"} rounded-r bg-zinc-50 p-4`}>
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#1A1A2E] font-black text-white">{comment.anonymous_name.slice(-4, -3)}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm text-[#1A1A2E]">{comment.anonymous_name}</strong>
                  <span className="text-xs text-zinc-500">{relativeTime(comment.created_at)}</span>
                  {comment.is_pinned && <span className="rounded bg-[#F5A623] px-2 py-1 text-xs font-black text-[#1A1A2E]">Dipin</span>}
                  {comment.is_filtered && <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-black text-yellow-800">Komentar telah disaring oleh sistem.</span>}
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-700">{comment.content_filtered}</p>
                {comment.admin_reply && (
                  <div className="mt-3 rounded border border-green-200 bg-green-50 p-3">
                    <p className="mb-1 inline-flex items-center gap-1 text-xs font-black uppercase text-green-700"><ShieldCheck size={14} /> Jawaban Resmi Pemerintah</p>
                    <p className="text-sm leading-6 text-green-900">{comment.admin_reply}</p>
                  </div>
                )}
              </div>
            </div>
          </article>
        )) : (
          <div className="rounded border border-dashed border-zinc-300 p-5 text-center text-sm font-bold text-zinc-500">
            Belum ada komentar untuk postingan ini.
          </div>
        )}
      </div>
      {sortedComments.length > visibleCount && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => Math.min(count + 5, sortedComments.length))}
            className="rounded border border-zinc-300 px-4 py-2 text-sm font-black text-[#1A1A2E] hover:border-[#C8102E] hover:text-[#C8102E]"
          >
            Lihat lebih banyak komentar ({sortedComments.length - visibleCount} lagi)
          </button>
        </div>
      )}
    </section>
  );
}
