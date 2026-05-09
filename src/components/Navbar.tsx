"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, X } from "lucide-react";

const navItems = [
  { label: "Beranda", href: "/" },
  { label: "Pembangunan", href: "/search?category=Pembangunan" },
  { label: "Anggaran", href: "/search?category=Anggaran" },
  { label: "Fasilitas", href: "/search?category=Fasilitas" },
  { label: "Pengumuman", href: "/search?category=Pengumuman" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function searchOnHome(query: string) {
    window.dispatchEvent(new CustomEvent("palembang-home-search", { detail: query }));
    document.getElementById("postingan-terbaru")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isHome) {
      searchOnHome(searchQuery.trim());
      return;
    }

    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    window.location.href = `/search${params.toString() ? `?${params.toString()}` : ""}`;
  }

  return (
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur transition-shadow ${scrolled ? "shadow-lg" : "shadow-sm"}`}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded bg-[#C8102E] font-serif text-xl font-bold text-white">PB</div>
          <div>
            <p className="font-serif text-2xl font-bold leading-none text-[#1A1A2E]">PalemBang</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#C8102E]">Transparansi APBD</p>
          </div>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="rounded px-3 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-100 hover:text-[#C8102E]">
              {item.label}
            </Link>
          ))}
          {searchOpen ? (
            <form onSubmit={submitSearch} className="ml-2 flex h-10 w-64 items-center gap-2 rounded border border-zinc-300 bg-white px-3 focus-within:border-[#C8102E] focus-within:ring-4 focus-within:ring-red-100">
              <Search size={17} className="shrink-0 text-zinc-500" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  if (isHome) searchOnHome(event.target.value);
                }}
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
                placeholder={isHome ? "Cari di beranda..." : "Cari postingan..."}
              />
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchOpen(false);
                  if (isHome) searchOnHome("");
                }}
                className="text-zinc-400 hover:text-[#C8102E]"
                aria-label="Tutup pencarian"
              >
                <X size={16} />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="ml-2 grid size-10 place-items-center rounded border border-zinc-200 text-zinc-700 hover:border-[#C8102E] hover:text-[#C8102E]"
              aria-label="Cari"
            >
              <Search size={18} />
            </button>
          )}
        </div>

        <button className="grid size-10 place-items-center rounded border border-zinc-200 lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Buka menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-zinc-100 bg-white px-4 py-3 lg:hidden">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="block rounded px-3 py-3 font-bold text-zinc-700 hover:bg-zinc-100">
              {item.label}
            </Link>
          ))}
          {isHome ? (
            <form
              onSubmit={(event) => {
                submitSearch(event);
                setOpen(false);
              }}
              className="mt-2 flex items-center gap-2 rounded bg-zinc-100 px-3 py-3"
            >
              <Search size={18} className="text-zinc-500" />
              <input
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  searchOnHome(event.target.value);
                }}
                className="min-w-0 flex-1 bg-transparent font-bold outline-none"
                placeholder="Cari di beranda..."
              />
            </form>
          ) : (
            <Link href="/search" onClick={() => setOpen(false)} className="mt-2 flex items-center gap-2 rounded bg-[#1A1A2E] px-3 py-3 font-bold text-white">
              <Search size={18} /> Cari
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
