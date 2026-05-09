import Image from "next/image";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { CommentSection } from "@/components/CommentSection";
import { BudgetWidget } from "@/components/BudgetWidget";
import { getBudgetItems, getComments, getPostBySlug, getPosts } from "@/lib/data";
import { formatDate, statusClass, statusLabel } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return {
    title: post ? `${post.title} - PalemBang` : "Postingan tidak ditemukan",
    description: post?.excerpt,
  };
}

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [budgetItems, comments] = await Promise.all([
    getBudgetItems(post.id),
    getComments(post.id),
  ]);

  return (
    <>
      <Navbar />
      <main className="bg-white">
        <section className="relative h-[420px] overflow-hidden bg-[#1A1A2E]">
          <Image src={post.thumbnail_url} alt={post.title} fill priority className="object-cover opacity-75" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E] via-[#1A1A2E]/35 to-transparent" />
          <div className="absolute bottom-0 left-1/2 w-full max-w-5xl -translate-x-1/2 px-4 pb-8 text-white">
            <span className="rounded bg-[#C8102E] px-3 py-1 text-sm font-black uppercase">{post.category}</span>
            <h1 className="mt-4 max-w-4xl font-serif text-4xl font-black leading-tight md:text-6xl">{post.title}</h1>
            <p className="mt-3 text-sm font-semibold text-white/80">{formatDate(post.published_at)} · {post.author_name}</p>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[1fr_340px]">
          <article>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className={`rounded px-3 py-1 text-sm font-black ${statusClass(post.status)}`}>{statusLabel(post.status)}</span>
              <span className="rounded bg-zinc-100 px-3 py-1 text-sm font-bold text-zinc-600">Progress anggaran {post.progress_percent}%</span>
            </div>
            <div className="prose max-w-none text-zinc-700" dangerouslySetInnerHTML={{ __html: post.content_html }} />
            {post.video_url?.includes("youtube.com/embed") ? (
              <iframe className="mt-8 aspect-video w-full rounded border border-zinc-200" src={post.video_url} title={post.title} allowFullScreen />
            ) : post.video_url ? (
              <video className="mt-8 aspect-video w-full rounded border border-zinc-200 bg-black" src={post.video_url} controls />
            ) : null}
            <CommentSection postId={post.id} initialComments={comments} />
          </article>
          <div className="lg:sticky lg:top-24 lg:self-start">
            <BudgetWidget post={post} items={budgetItems} />
          </div>
        </section>
      </main>
    </>
  );
}
