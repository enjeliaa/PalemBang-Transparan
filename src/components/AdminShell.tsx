"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, FilePenLine, LayoutDashboard, Menu, MessageSquare, Newspaper, X } from "lucide-react";

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Postingan", icon: Newspaper },
  { href: "/admin/comments", label: "Komentar", icon: MessageSquare },
  { href: "/admin/analytics", label: "Analitik", icon: BarChart3 },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 bg-[#1A1A2E] p-5 text-white lg:block">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded bg-[#C8102E] font-serif text-xl font-bold">PB</div>
          <div>
            <p className="font-serif text-2xl font-black">PalemBang</p>
            <p className="text-xs uppercase text-white/60">Admin Pemerintah</p>
          </div>
        </Link>
        <nav className="space-y-2">
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded px-3 py-3 font-bold text-white/80 hover:bg-white/10 hover:text-white">
                <Icon size={18} /> {item.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/admin/posts/new" className="absolute bottom-5 left-5 right-5 inline-flex items-center justify-center gap-2 rounded bg-[#F5A623] px-4 py-3 font-black text-[#1A1A2E]">
          <FilePenLine size={18} /> Buat Artikel
        </Link>
      </aside>
      <main className="lg:pl-72">
        <div className="sticky top-0 z-20 border-b border-zinc-200 bg-white px-4 py-4 shadow-sm lg:px-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-zinc-500">Panel Admin</p>
              <h1 className="font-serif text-2xl font-black text-[#1A1A2E]">Transparansi Pembangunan Kota Palembang</h1>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="grid size-11 shrink-0 place-items-center rounded border border-zinc-200 text-[#1A1A2E] lg:hidden"
              aria-label={mobileMenuOpen ? "Tutup menu admin" : "Buka menu admin"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
          {mobileMenuOpen && (
            <nav className="mt-4 grid gap-2 border-t border-zinc-100 pt-4 lg:hidden">
              {adminNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded border border-zinc-200 px-3 py-3 font-bold text-[#1A1A2E]"
                  >
                    <Icon size={18} /> {item.label}
                  </Link>
                );
              })}
              <Link
                href="/admin/posts/new"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded bg-[#F5A623] px-4 py-3 font-black text-[#1A1A2E]"
              >
                <FilePenLine size={18} /> Buat Artikel
              </Link>
            </nav>
          )}
        </div>
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
