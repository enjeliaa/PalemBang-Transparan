import type { BudgetItem, Post } from "@/types";
import { budgetColor, formatRupiah } from "@/lib/utils";

export function BudgetWidget({ post, items = [] }: { post: Post; items?: BudgetItem[] }) {
  const remaining = Math.max(post.budget_total - post.budget_realized, 0);

  return (
    <aside className="rounded border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-[#C8102E]">Widget Anggaran</p>
          <h2 className="mt-1 font-serif text-2xl font-black text-[#1A1A2E]">Realisasi APBD</h2>
        </div>
        <span className="rounded bg-zinc-100 px-3 py-1 text-sm font-black text-zinc-700">{post.progress_percent}%</span>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-200">
        <div className={`h-full ${budgetColor(post.progress_percent)}`} style={{ width: `${post.progress_percent}%` }} />
      </div>

      <div className="mt-5 grid gap-3 text-sm">
        <div className="flex justify-between gap-4"><span className="text-zinc-500">Total Alokasi</span><strong>{formatRupiah(post.budget_total)}</strong></div>
        <div className="flex justify-between gap-4"><span className="text-zinc-500">Realisasi</span><strong className="text-[#2ECC71]">{formatRupiah(post.budget_realized)}</strong></div>
        <div className="flex justify-between gap-4"><span className="text-zinc-500">Sisa Anggaran</span><strong>{formatRupiah(remaining)}</strong></div>
      </div>

      {items.length > 0 && (
        <div className="mt-6 space-y-3 border-t border-zinc-100 pt-4">
          {items.map((item) => (
            <div key={item.id} className="rounded bg-zinc-50 p-3">
              <p className="font-bold text-[#1A1A2E]">{item.item_name}</p>
              <p className="mt-1 text-xs text-zinc-500">{item.description}</p>
              <p className="mt-2 text-xs font-bold text-zinc-700">{formatRupiah(item.realized_amount)} / {formatRupiah(item.allocated_amount)}</p>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
