import Link from "next/link";
import type { Post } from "@/types";

export function NewsTicker({ posts }: { posts: Post[] }) {
  const items = [...posts, ...posts];

  return (
    <section className="bg-[#C8102E] text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-[96px_minmax(0,1fr)] items-center px-4 lg:grid-cols-[120px_minmax(0,1fr)] lg:px-6">
        <div className="relative z-10 flex h-full items-center justify-center bg-[#1A1A2E] px-3 py-3 text-xs font-black uppercase sm:text-sm">
          Terbaru
        </div>
        <div className="min-w-0 overflow-hidden">
          <div className="ticker-track flex w-max gap-8 whitespace-nowrap py-3 pl-6">
            {items.map((post, index) => (
              <Link key={`${post.id}-${index}`} href={`/posts/${post.slug}`} className="text-sm font-bold hover:underline">
                {post.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
