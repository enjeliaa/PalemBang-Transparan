"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Post } from "@/types";
import { RichTextEditor } from "@/components/RichTextEditor";

type Props = {
  mode: "create" | "edit";
  post?: Post;
};

export function AdminPostForm({ mode, post }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(post?.thumbnail_url ?? "");
  const [videoUrl, setVideoUrl] = useState(post?.video_url ?? "");

  async function getErrorMessage(response: Response, fallback: string) {
    try {
      const data = await response.json();
      return typeof data.error === "string" ? data.error : fallback;
    } catch {
      return fallback;
    }
  }

  async function uploadMedia(file: File, target: "thumbnail" | "video") {
    if (target === "video" && file.size > 45 * 1024 * 1024) {
      setMessage("Video terlalu besar untuk upload lewat form. Pakai URL YouTube/embed atau upload ke Supabase Storage lalu tempel URL publiknya.");
      return;
    }

    setMessage("Mengupload media...");
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      setMessage(await getErrorMessage(response, "Upload gagal. Pastikan login sebagai admin dan Supabase Storage sudah siap."));
      return;
    }

    const data = await response.json();
    if (target === "thumbnail") setThumbnailUrl(data.url);
    if (target === "video") setVideoUrl(data.url);
    setMessage("Media berhasil diupload.");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get("title") ?? ""),
      slug: String(form.get("slug") ?? ""),
      category: String(form.get("category") ?? "Pembangunan"),
      excerpt: String(form.get("excerpt") ?? ""),
      content_html: String(form.get("content_html") ?? "<p>Konten artikel akan diperbarui dari editor.</p>"),
      thumbnail_url: thumbnailUrl || String(form.get("thumbnail_url") ?? ""),
      video_url: videoUrl || String(form.get("video_url") ?? ""),
      budget_total: Number(form.get("budget_total") ?? 0),
      budget_realized: Number(form.get("budget_realized") ?? 0),
      progress_percent: Number(form.get("progress_percent") ?? 0),
      status: String(form.get("status") ?? "planning"),
      author_name: "Pemerintah Kota Palembang",
    };

    const response = await fetch(mode === "create" ? "/api/posts" : `/api/posts/${post?.id}`, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!response.ok) {
      setMessage(await getErrorMessage(response, "Gagal menyimpan. Pastikan kamu login sebagai admin pemerintah."));
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/admin/posts");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="font-serif text-3xl font-black">{mode === "create" ? "Buat Artikel Pembangunan" : "Edit Artikel Pembangunan"}</h2>
        <div className="mt-5 space-y-4">
          <input name="title" defaultValue={post?.title} required className="w-full rounded border border-zinc-300 px-3 py-3 text-lg font-bold" placeholder="Judul artikel" />
          <input name="slug" defaultValue={post?.slug} required className="w-full rounded border border-zinc-300 px-3 py-3" placeholder="Slug, contoh: renovasi-jalan-sudirman" />
          <textarea name="excerpt" defaultValue={post?.excerpt} className="min-h-24 w-full rounded border border-zinc-300 px-3 py-3" placeholder="Ringkasan singkat artikel" />
          <input name="content_html" defaultValue={post?.content_html} className="w-full rounded border border-zinc-300 px-3 py-3" placeholder="HTML konten untuk database" />
          <RichTextEditor />
        </div>
      </section>
      <aside className="space-y-4">
        <div className="rounded border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="font-serif text-xl font-black">Publikasi</h3>
          <select name="category" defaultValue={post?.category ?? "Pembangunan"} className="mt-4 w-full rounded border border-zinc-300 px-3 py-3">
            <option>Pembangunan</option>
            <option>Anggaran</option>
            <option>Fasilitas</option>
            <option>Pengumuman</option>
          </select>
          <select name="status" defaultValue={post?.status ?? "planning"} className="mt-3 w-full rounded border border-zinc-300 px-3 py-3">
            <option value="planning">Perencanaan</option>
            <option value="ongoing">Sedang Berjalan</option>
            <option value="done">Selesai</option>
          </select>
          <button disabled={loading} className="mt-4 w-full rounded bg-[#C8102E] px-4 py-3 font-black text-white disabled:opacity-60">
            {loading ? "Menyimpan..." : "Simpan Postingan"}
          </button>
          {message && <p className="mt-3 rounded bg-zinc-50 p-3 text-sm font-bold text-zinc-700">{message}</p>}
        </div>
        <div className="rounded border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="font-serif text-xl font-black">Anggaran</h3>
          <input name="budget_total" type="number" defaultValue={post?.budget_total} className="mt-4 w-full rounded border border-zinc-300 px-3 py-3" placeholder="Total alokasi" />
          <input name="budget_realized" type="number" defaultValue={post?.budget_realized} className="mt-3 w-full rounded border border-zinc-300 px-3 py-3" placeholder="Realisasi" />
          <input name="progress_percent" type="number" min="0" max="100" defaultValue={post?.progress_percent} className="mt-3 w-full rounded border border-zinc-300 px-3 py-3" placeholder="Progress persen" />
        </div>
        <div className="rounded border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="font-serif text-xl font-black">Foto & Video</h3>
          <input name="thumbnail_url" value={thumbnailUrl} onChange={(event) => setThumbnailUrl(event.target.value)} className="mt-4 w-full rounded border border-zinc-300 px-3 py-3" placeholder="URL foto thumbnail" />
          <label className="mt-3 block text-xs font-black uppercase text-zinc-500">Upload Foto</label>
          <input type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && uploadMedia(event.target.files[0], "thumbnail")} className="mt-2 w-full rounded border border-dashed border-zinc-300 p-4 text-sm" />
          <input name="video_url" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} className="mt-4 w-full rounded border border-zinc-300 px-3 py-3" placeholder="URL YouTube / youtu.be / video HTML5" />
          <label className="mt-3 block text-xs font-black uppercase text-zinc-500">Upload Video</label>
          <input type="file" accept="video/*" onChange={(event) => event.target.files?.[0] && uploadMedia(event.target.files[0], "video")} className="mt-2 w-full rounded border border-dashed border-zinc-300 p-4 text-sm" />
          <p className="mt-2 text-xs text-zinc-500">File dikirim ke API `/api/upload` dan saat production disimpan ke Supabase Storage bucket `palembang-media`.</p>
        </div>
      </aside>
    </form>
  );
}
