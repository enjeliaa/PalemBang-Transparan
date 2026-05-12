"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle2, MessageSquareReply } from "lucide-react";
import type { Comment } from "@/types";
import { relativeTime } from "@/lib/utils";

const readRepliesKey = "palembang_read_replies";

function getAnonymousName() {
  if (typeof window === "undefined") return "";
  const existing = localStorage.getItem("palembang_anonymous_name");
  if (existing) return existing;
  const number = Math.floor(1000 + Math.random() * 9000);
  const name = `Warga Palembang #${number}`;
  localStorage.setItem("palembang_anonymous_name", name);
  return name;
}

function getReadReplyIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(readRepliesKey) ?? "[]") as string[]);
  } catch {
    return new Set<string>();
  }
}

function saveReadReplyIds(ids: Set<string>) {
  localStorage.setItem(readRepliesKey, JSON.stringify([...ids]));
}

export function WargaNotifications() {
  const [open, setOpen] = useState(false);
  const [anonymousName, setAnonymousName] = useState("");
  const [replies, setReplies] = useState<Comment[]>([]);
  const [readReplyIds, setReadReplyIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    window.queueMicrotask(() => {
      setAnonymousName(getAnonymousName());
      setReadReplyIds(getReadReplyIds());
    });
  }, []);

  useEffect(() => {
    if (!anonymousName) return;

    let cancelled = false;

    async function loadReplies() {
      const response = await fetch(`/api/comments?anonymousName=${encodeURIComponent(anonymousName)}`, {
        cache: "no-store",
      }).catch(() => null);

      if (!response?.ok) return;
      const data = (await response.json().catch(() => [])) as Comment[];
      if (!cancelled) setReplies(data);
    }

    loadReplies();
    const interval = window.setInterval(loadReplies, 60000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [anonymousName]);

  const unreadReplies = useMemo(
    () => replies.filter((reply) => !readReplyIds.has(reply.id)),
    [readReplyIds, replies],
  );

  function markAllRead() {
    const next = new Set(readReplyIds);
    for (const reply of replies) next.add(reply.id);
    setReadReplyIds(next);
    saveReadReplyIds(next);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative grid size-10 place-items-center rounded border border-zinc-200 text-zinc-700 hover:border-[#C8102E] hover:text-[#C8102E]"
        aria-label="Notifikasi balasan pemerintah"
      >
        <Bell size={18} />
        {unreadReplies.length > 0 && (
          <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-[#C8102E] px-1 text-xs font-black text-white">
            {unreadReplies.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(21rem,calc(100vw-2rem))] rounded border border-zinc-200 bg-white p-4 text-left shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black text-[#1A1A2E]">Balasan Pemerintah</p>
              <p className="mt-1 text-xs font-semibold text-zinc-500">{anonymousName || "Warga anonim"}</p>
            </div>
            {unreadReplies.length > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs font-black text-[#C8102E]">
                Tandai dibaca
              </button>
            )}
          </div>

          <div className="mt-3 max-h-80 space-y-3 overflow-y-auto">
            {replies.length > 0 ? replies.slice(0, 5).map((reply) => (
              <Link
                key={reply.id}
                href={reply.post_slug ? `/posts/${reply.post_slug}` : "/"}
                onClick={() => setOpen(false)}
                className="block rounded border border-zinc-100 bg-zinc-50 p-3 hover:border-green-300 hover:bg-green-50"
              >
                <div className="flex items-center gap-2 text-xs font-black uppercase text-green-700">
                  {readReplyIds.has(reply.id) ? <CheckCircle2 size={14} /> : <MessageSquareReply size={14} />}
                  {readReplyIds.has(reply.id) ? "Sudah dibaca" : "Balasan baru"}
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-bold text-[#1A1A2E]">{reply.admin_reply}</p>
                <p className="mt-2 line-clamp-1 text-xs text-zinc-500">Komentar kamu: {reply.content_filtered}</p>
                <p className="mt-1 text-xs font-semibold text-zinc-400">{relativeTime(reply.created_at)}</p>
              </Link>
            )) : (
              <div className="rounded border border-dashed border-zinc-200 p-4 text-center text-sm font-bold text-zinc-500">
                Belum ada balasan resmi untuk komentar kamu.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
