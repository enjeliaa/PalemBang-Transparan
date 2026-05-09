import { AnalyticsChart } from "@/components/AnalyticsChart";
import { AiSummaryPanel } from "@/components/AiSummaryPanel";
import { getComments } from "@/lib/data";
import { getKeywordAnalytics } from "@/lib/analytics";
import { isAdmin } from "@/lib/permissions";
import { redirect } from "next/navigation";

export const metadata = { title: "Analitik Aspirasi - PalemBang" };

export default async function AnalyticsPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const comments = await getComments();
  const analytics = getKeywordAnalytics(comments);

  return (
    <div className="space-y-6">
      <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-black uppercase text-[#C8102E]">Analitik Aspirasi</p>
        <h2 className="font-serif text-3xl font-black">10 Keyword Paling Sering Muncul</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Keyword hanya dihitung dari komentar warga. Untuk admin, sistem membaca komentar mentah sebelum sensor agar isu seperti banjir, korupsi, narkoba, jalan rusak, sampah, keamanan, dan layanan dasar tetap terdeteksi.
        </p>
      </section>

      <AnalyticsChart data={analytics} />

      <section className="rounded border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-2xl font-black">Tabel Tren Mingguan</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-zinc-100 text-xs uppercase text-zinc-500">
              <tr>
                <th className="p-3">Keyword</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Jumlah</th>
                <th className="p-3">Sumber</th>
                <th className="p-3">Tren vs Minggu Lalu</th>
                <th className="p-3">Indikasi Urgensi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {analytics.map((item) => (
                <tr key={item.keyword}>
                  <td className="p-3 font-black">
                    {item.keyword}
                    {item.monitored && <span className="ml-2 rounded bg-[#F5A623] px-2 py-1 text-[10px] font-black uppercase text-[#1A1A2E]">dipantau</span>}
                  </td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3">{item.count}</td>
                  <td className="p-3 text-xs font-bold uppercase text-zinc-500">Komentar warga</td>
                  <td className={`p-3 font-black ${item.trend >= 0 ? "text-green-600" : "text-red-600"}`}>{item.trend >= 0 ? "naik" : "turun"} {Math.abs(item.trend)}%</td>
                  <td className={`p-3 font-black ${item.urgency === "Kritis" ? "text-red-700" : item.urgency === "Tinggi" ? "text-orange-600" : "text-zinc-700"}`}>{item.urgency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <AiSummaryPanel />
    </div>
  );
}
