"use client";

import { FormEvent, useState } from "react";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").toLowerCase();

    if (email !== "admin@palembang.go.id") {
      setError("Halaman ini khusus admin pemerintah.");
      return;
    }

    const response = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: String(form.get("password") ?? ""),
      }),
    });

    if (!response.ok) {
      setError("Email atau password admin tidak sesuai.");
      return;
    }

    window.location.href = "/admin/dashboard";
  }

  return (
    <div className="mx-auto max-w-md rounded border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-6 grid size-12 place-items-center rounded bg-[#C8102E] text-white">
        <Lock size={22} />
      </div>
      <h2 className="font-serif text-3xl font-black text-[#1A1A2E]">Login Admin</h2>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input name="email" type="email" className="w-full rounded border border-zinc-300 px-3 py-3" placeholder="Email admin" />
        <input name="password" type="password" className="w-full rounded border border-zinc-300 px-3 py-3" placeholder="Password" />
        {error && <p className="rounded bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
        <button className="w-full rounded bg-[#C8102E] px-4 py-3 font-black text-white">Masuk sebagai Admin Pemerintah</button>
      </form>
      <p className="mt-5 text-center text-sm text-zinc-500">Warga tidak perlu login untuk memberi komentar.</p>
    </div>
  );
}
