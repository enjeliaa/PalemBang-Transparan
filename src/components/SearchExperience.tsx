"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PostCard } from "@/components/PostCard";
import type { Post } from "@/types";

export function SearchExperience({ posts, initialCategory = "" }: { posts: Post[]; initialCategory?: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState("");
  const [year, setYear] = useState("");

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const text = `${post.title} ${post.excerpt}`.toLowerCase();
      const matchQuery = text.includes(query.toLowerCase());
      const matchCategory = !category || post.category === category;
      const matchStatus = !status || post.status === status;
      const matchYear = !year || new Date(post.published_at).getFullYear().toString() === year;
      return matchQuery && matchCategory && matchStatus && matchYear;
    });
  }, [posts, query, category, status, year]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <div className="rounded border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 rounded border border-zinc-300 px-3 py-3 focus-within:border-[#C8102E] focus-within:ring-4 focus-within:ring-red-100">
          <Search size={20} className="text-zinc-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full outline-none" placeholder="Cari proyek, fasilitas, anggaran, atau aspirasi..." />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded border border-zinc-300 px-3 py-3">
            <option value="">Semua kategori</option>
            <option>Pembangunan</option>
            <option>Anggaran</option>
            <option>Fasilitas</option>
            <option>Pengumuman</option>
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded border border-zinc-300 px-3 py-3">
            <option value="">Semua status</option>
            <option value="planning">Perencanaan</option>
            <option value="ongoing">Sedang Berjalan</option>
            <option value="done">Selesai</option>
          </select>
          <select value={year} onChange={(event) => setYear(event.target.value)} className="rounded border border-zinc-300 px-3 py-3">
            <option value="">Semua tahun</option>
            <option>2026</option>
            <option>2025</option>
          </select>
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((post) => <PostCard key={post.id} post={post} />)}
      </div>
      {filtered.length === 0 && <p className="mt-8 rounded bg-white p-6 text-center font-bold text-zinc-500">Tidak ada hasil yang cocok.</p>}
    </section>
  );
}
