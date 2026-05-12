import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/types";
import { budgetColor, formatDate, statusClass, statusLabel } from "@/lib/utils";

export function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <Link href={`/posts/${post.slug}`} className={`group block overflow-hidden rounded border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${featured ? "lg:row-span-2" : ""}`}>
      <div className={`relative ${featured ? "aspect-[16/10]" : "aspect-[16/9]"}`}>
        <Image src={post.thumbnail_url} alt={post.title} fill className="object-cover object-center brightness-105 transition duration-500 group-hover:scale-105" sizes={featured ? "(min-width: 1024px) 55vw, 100vw" : "(min-width: 1024px) 25vw, 100vw"} />
        <div className="absolute left-3 top-3 rounded bg-[#C8102E] px-2 py-1 text-xs font-black uppercase text-white">{post.category}</div>
      </div>
      <div className={featured ? "p-5" : "p-4"}>
        <div className="mb-2 flex items-center gap-2">
          <span className={`rounded px-2 py-1 text-xs font-black ${statusClass(post.status)}`}>{statusLabel(post.status)}</span>
          <span className="text-xs font-semibold text-zinc-500">{formatDate(post.published_at)}</span>
        </div>
        <h2 className={`font-serif font-black leading-tight text-[#1A1A2E] group-hover:text-[#C8102E] ${featured ? "text-3xl" : "text-lg"}`}>{post.title}</h2>
        {featured && <p className="mt-3 text-sm leading-6 text-zinc-600">{post.excerpt}</p>}
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs font-bold text-zinc-500">
            <span>Realisasi Anggaran</span><span>{post.progress_percent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
            <div className={`h-full ${budgetColor(post.progress_percent)}`} style={{ width: `${post.progress_percent}%` }} />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function PostGrid({ posts }: { posts: Post[] }) {
  const [featured, ...rest] = posts;

  return (
    <section id="postingan-terbaru" className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-[#C8102E]">Update Pemerintah Kota</p>
          <h2 className="font-serif text-4xl font-black text-[#1A1A2E]">Postingan Terbaru</h2>
        </div>
        <Link href="/search" className="hidden rounded border border-zinc-300 px-4 py-2 text-sm font-black text-[#1A1A2E] hover:border-[#C8102E] hover:text-[#C8102E] sm:block">Lihat semua</Link>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {featured && <PostCard post={featured} featured />}
        <div className="grid gap-5 sm:grid-cols-2">
          {rest.slice(0, 4).map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      </div>
    </section>
  );
}
