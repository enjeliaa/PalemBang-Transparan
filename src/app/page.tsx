import { Navbar } from "@/components/Navbar";
import { NewsTicker } from "@/components/NewsTicker";
import { HomePostGrid } from "@/components/HomePostGrid";
import { VideoHero } from "@/components/VideoHero";
import { BudgetWidget } from "@/components/BudgetWidget";
import { getPosts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await getPosts();
  const highlighted = posts[0];

  return (
    <>
      <Navbar />
      <VideoHero />
      <NewsTicker posts={posts} />
      <HomePostGrid posts={posts} />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-14 lg:grid-cols-[1fr_420px] lg:px-6">
        <div className="rounded border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase text-[#C8102E]">Kenapa PalemBang</p>
          <h2 className="mt-2 font-serif text-3xl font-black text-[#1A1A2E]">Transparansi yang bisa dibaca warga, bukan hanya dokumen panjang.</h2>
          <p className="mt-4 leading-8 text-zinc-600">
            PalemBang menyatukan artikel proyek, status pekerjaan, rincian anggaran, dan komentar anonim warga dalam satu portal resmi. Pemerintah dapat membaca urgensi lapangan, sementara warga dapat memantau realisasi APBD secara terbuka.
          </p>
        </div>
        {highlighted && <BudgetWidget post={highlighted} />}
      </section>
    </>
  );
}
