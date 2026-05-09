import type { Comment } from "@/types";

const stopwords = new Set([
  "yang", "dan", "di", "ke", "dari", "untuk", "dengan", "ini", "itu", "ada",
  "agar", "mohon", "tolong", "sudah", "masih", "lebih", "kami", "saya",
  "warga", "palembang", "pada", "dalam", "atau", "jadi", "bisa", "buat",
]);

const issueKeywords = [
  {
    keyword: "banjir",
    category: "Lingkungan",
    urgency: "Tinggi",
    aliases: ["banjir", "genangan", "terendam", "drainase", "mampet", "air naik"],
  },
  {
    keyword: "korupsi",
    category: "Integritas",
    urgency: "Kritis",
    aliases: ["korupsi", "pungli", "suap", "mark up", "markup", "anggaran bocor", "fee proyek"],
  },
  {
    keyword: "narkoba",
    category: "Keamanan Sosial",
    urgency: "Kritis",
    aliases: ["narkoba", "sabu", "ganja", "obat terlarang", "pengedar"],
  },
  {
    keyword: "jalan rusak",
    category: "Infrastruktur",
    urgency: "Tinggi",
    aliases: ["jalan rusak", "berlubang", "aspal retak", "lubang jalan", "jalan hancur"],
  },
  {
    keyword: "sampah",
    category: "Lingkungan",
    urgency: "Sedang",
    aliases: ["sampah", "bau", "tps", "limbah", "kotor"],
  },
  {
    keyword: "lampu jalan",
    category: "Fasilitas Publik",
    urgency: "Sedang",
    aliases: ["lampu", "penerangan", "gelap", "pju"],
  },
  {
    keyword: "keamanan",
    category: "Ketertiban",
    urgency: "Tinggi",
    aliases: ["keamanan", "rawan", "begal", "preman", "maling", "kriminal"],
  },
  {
    keyword: "macet",
    category: "Transportasi",
    urgency: "Sedang",
    aliases: ["macet", "kemacetan", "parkir liar", "jalan sempit"],
  },
  {
    keyword: "air bersih",
    category: "Layanan Dasar",
    urgency: "Tinggi",
    aliases: ["air bersih", "air mati", "pdam", "air keruh", "air kecil"],
  },
  {
    keyword: "toilet",
    category: "Fasilitas Publik",
    urgency: "Sedang",
    aliases: ["toilet", "wc", "kamar mandi", "sanitasi"],
  },
];

function countAliases(text: string, aliases: string[]) {
  return aliases.reduce((total, alias) => {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    return total + (text.match(regex)?.length ?? 0);
  }, 0);
}

export function getKeywordAnalytics(comments: Comment[]) {
  const counts = new Map<string, number>();

  const commentText = comments
    .map((comment) => comment.content_raw || comment.content_filtered)
    .join(" ")
    .toLowerCase();

  const issueRows = issueKeywords
    .map((issue, index) => ({
      keyword: issue.keyword,
      count: countAliases(commentText, issue.aliases),
      trend: issue.urgency === "Kritis" ? 24 : index % 3 === 0 ? 12 : index % 3 === 1 ? -6 : 3,
      category: issue.category,
      urgency: issue.urgency,
      monitored: true,
    }))
    .filter((item) => item.count > 0);

  for (const text of comments.map((comment) => comment.content_raw || comment.content_filtered)) {
    const words = text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopwords.has(word));

    for (const word of words) {
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }

  const organicRows = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([keyword, count], index) => ({
      keyword,
      count,
      trend: index % 3 === 0 ? 12 : index % 3 === 1 ? -6 : 3,
      category: "Aspirasi Umum",
      urgency: count > 2 ? "Tinggi" : count > 1 ? "Sedang" : "Normal",
      monitored: false,
    }));

  const merged = new Map<string, (typeof issueRows | typeof organicRows)[number]>();

  for (const row of organicRows) merged.set(row.keyword, row);
  for (const row of issueRows) merged.set(row.keyword, row);

  return [...merged.values()]
    .sort((a, b) => {
      const urgencyRank = { Kritis: 4, Tinggi: 3, Sedang: 2, Normal: 1 } as Record<string, number>;
      return b.count - a.count || urgencyRank[b.urgency] - urgencyRank[a.urgency];
    })
    .slice(0, 10);
}
