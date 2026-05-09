"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import type { Post } from "@/types";

export function HomePostGrid({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    function handleSearch(event: Event) {
      const detail = (event as CustomEvent<string>).detail ?? "";
      setQuery(detail);
    }

    window.addEventListener("palembang-home-search", handleSearch);
    return () => window.removeEventListener("palembang-home-search", handleSearch);
  }, []);

  const filteredPosts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return posts;

    return posts.filter((post) => {
      const haystack = `${post.title} ${post.excerpt} ${post.category} ${post.author_name}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [posts, query]);

  const [featured, ...rest] = filteredPosts;

  return (
    <section id="postingan-terbaru" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 lg:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-[#C8102E]">Update Pemerintah Kota</p>
          <h2 className="font-serif text-4xl font-black text-[#1A1A2E]">
            {query.trim() ? `Hasil pencarian "${query.trim()}"` : "Postingan Terbaru"}
          </h2>
          {query.trim() && <p className="mt-2 text-sm font-bold text-zinc-500">{filteredPosts.length} postingan ditemukan di beranda.</p>}
        </div>
        <Link href="/search" className="hidden rounded border border-zinc-300 px-4 py-2 text-sm font-black text-[#1A1A2E] hover:border-[#C8102E] hover:text-[#C8102E] sm:block">
          Filter lengkap
        </Link>
      </div>

      {filteredPosts.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {featured && <PostCard post={featured} featured />}
          <div className="grid gap-5 sm:grid-cols-2">
            {rest.slice(0, 4).map((post) => <PostCard key={post.id} post={post} />)}
          </div>
        </div>
      ) : (
        <div className="rounded border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <p className="font-serif text-2xl font-black text-[#1A1A2E]">Tidak ada postingan yang cocok.</p>
          <p className="mt-2 text-sm text-zinc-500">Coba kata kunci lain seperti jalan, taman, anggaran, atau drainase.</p>
        </div>
      )}
    </section>
  );
}
