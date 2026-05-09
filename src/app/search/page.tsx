import { Navbar } from "@/components/Navbar";
import { SearchExperience } from "@/components/SearchExperience";
import { getPosts } from "@/lib/data";

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export const metadata = {
  title: "Cari Proyek - PalemBang",
  description: "Cari dan filter proyek pembangunan, anggaran, fasilitas, dan pengumuman Kota Palembang.",
};

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: Props) {
  const [posts, params] = await Promise.all([getPosts(), searchParams]);

  return (
    <>
      <Navbar />
      <header className="bg-[#1A1A2E] px-4 py-12 text-white">
        <div className="mx-auto max-w-7xl lg:px-6">
          <p className="text-sm font-black uppercase text-[#F5A623]">Pencarian & Filter</p>
          <h1 className="mt-2 font-serif text-5xl font-black">Temukan Proyek dan Anggaran</h1>
        </div>
      </header>
      <SearchExperience posts={posts} initialCategory={params.category ?? ""} />
    </>
  );
}
