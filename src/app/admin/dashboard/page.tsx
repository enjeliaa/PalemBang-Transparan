import Link from "next/link";
import { BarChart3, MessageSquare, Newspaper, PlusCircle } from "lucide-react";
import { getDashboardStats, getPosts } from "@/lib/data";
import { formatRupiah } from "@/lib/utils";
import { isAdmin } from "@/lib/permissions";
import { redirect } from "next/navigation";

export const metadata = { title: "Dashboard Admin - PalemBang" };

export default async function AdminDashboardPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const [stats, posts] = await Promise.all([getDashboardStats(), getPosts()]);
  const totalBudget = posts.reduce((sum, post) => sum + post.budget_total, 0);
  const realizedBudget = posts.reduce((sum, post) => sum + post.budget_realized, 0);

  const cards = [
    { label: "Total Post", value: stats.totalPosts, icon: Newspaper },
    { label: "Total Komentar", value: stats.totalComments, icon: MessageSquare },
    { label: "Post Bulan Ini", value: stats.postsThisMonth, icon: PlusCircle },
    { label: "Komentar Hari Ini", value: stats.commentsToday, icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded border border-zinc-200 bg-white p-5 shadow-sm">
              <Icon className="mb-4 text-[#C8102E]" />
              <p className="text-sm font-bold text-zinc-500">{card.label}</p>
              <p className="mt-1 text-3xl font-black text-[#1A1A2E]">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-black">Postingan Terbaru</h2>
            <Link href="/admin/posts/new" className="rounded bg-[#C8102E] px-3 py-2 text-sm font-black text-white">Buat Baru</Link>
          </div>
          <div className="divide-y divide-zinc-100">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-bold text-[#1A1A2E]">{post.title}</p>
                  <p className="text-sm text-zinc-500">{post.category} · {post.progress_percent}%</p>
                </div>
                <Link href={`/posts/${post.slug}`} className="text-sm font-black text-[#C8102E]">Lihat</Link>
              </div>
            ))}
          </div>
        </section>
        <aside className="rounded border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-black uppercase text-[#C8102E]">Ringkasan APBD Demo</p>
          <h2 className="mt-1 font-serif text-2xl font-black">Kinerja Anggaran</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><span>Total Alokasi</span><strong>{formatRupiah(totalBudget)}</strong></div>
            <div className="flex justify-between"><span>Total Realisasi</span><strong>{formatRupiah(realizedBudget)}</strong></div>
            <div className="h-3 overflow-hidden rounded-full bg-zinc-200">
              <div className="h-full bg-[#2ECC71]" style={{ width: `${Math.round((realizedBudget / totalBudget) * 100)}%` }} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
