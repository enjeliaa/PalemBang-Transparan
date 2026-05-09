"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function deletePost() {
    const confirmed = window.confirm("Hapus postingan ini?");
    if (!confirmed) return;

    setLoading(true);
    const response = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    setLoading(false);

    if (!response.ok) {
      window.alert("Gagal menghapus postingan. Pastikan login sebagai admin.");
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={deletePost}
      disabled={loading}
      className="grid size-9 place-items-center rounded border border-zinc-200 text-red-600 disabled:opacity-50"
      title="Hapus"
    >
      <Trash2 size={16} />
    </button>
  );
}
