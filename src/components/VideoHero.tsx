import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3 } from "lucide-react";

export function VideoHero() {
  return (
    <section className="relative min-h-[520px] overflow-hidden bg-[#1A1A2E] text-white">
      <Image
        src="/ampera0.png"
        alt="Jembatan Ampera Palembang pada malam hari"
        fill
        priority
        className="object-cover object-[52%_50%] brightness-110 sm:object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A2E]/82 via-[#1A1A2E]/50 to-[#C8102E]/25" />
      <div className="absolute inset-0 bg-black/5" />
      <div className="relative mx-auto flex min-h-[520px] max-w-7xl flex-col justify-center px-4 py-20 lg:px-6">
        <p className="mb-4 w-fit rounded bg-[#F5A623] px-3 py-1 text-sm font-black uppercase text-[#1A1A2E] animate-fade-in">
          Portal Resmi Transparansi Pembangunan
        </p>
        <h1 className="max-w-3xl font-serif text-5xl font-black leading-tight md:text-7xl animate-fade-in">
          Palembang Terbuka, Palembang Maju
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90">
          Pantau rencana, progres, anggaran, dan aspirasi warga untuk pembangunan fasilitas publik Kota Palembang.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="#postingan-terbaru" className="inline-flex items-center justify-center gap-2 rounded bg-[#C8102E] px-5 py-3 font-black text-white shadow-lg transition hover:scale-[1.02]">
            Lihat Postingan Terbaru <ArrowRight size={18} />
          </Link>
          <Link href="/search?category=Anggaran" className="inline-flex items-center justify-center gap-2 rounded bg-white px-5 py-3 font-black text-[#1A1A2E] shadow-lg transition hover:scale-[1.02]">
            <BarChart3 size={18} /> Lihat Anggaran
          </Link>
        </div>
      </div>
    </section>
  );
}
