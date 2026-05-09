"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

const initialSummary =
  "Dashboard ini tidak membuat isu sendiri. Kata seperti banjir, korupsi, narkoba, atau jalan rusak baru muncul jika warga menuliskannya di kolom komentar.";

export function AiSummaryPanel() {
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function refreshSummary() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ai-summary", { credentials: "include" });
      const data = await response.json();

      if (!response.ok || typeof data.summary !== "string") {
        throw new Error(data.error ?? "Ringkasan AI gagal dimuat.");
      }

      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ringkasan AI gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded border border-green-200 bg-green-50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-black uppercase text-green-700">Ringkasan AI Demo</p>
        <button
          type="button"
          onClick={refreshSummary}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded bg-[#1A1A2E] px-4 py-2 text-sm font-black text-white disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Memuat..." : "Refresh Ringkasan AI"}
        </button>
      </div>
      <p className="mt-3 leading-7 text-green-900">{summary}</p>
      {error && <p className="mt-3 rounded bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
    </section>
  );
}
