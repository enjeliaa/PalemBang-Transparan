import { NextResponse } from "next/server";
import { getKeywordAnalytics } from "@/lib/analytics";
import { getComments } from "@/lib/data";

export async function GET() {
  const comments = await getComments();
  const analytics = getKeywordAnalytics(comments);

  if (!comments.length || !analytics.length) {
    return NextResponse.json({
      summary: "Belum ada komentar warga yang cukup untuk membuat ringkasan. Ringkasan akan muncul setelah warga menulis aspirasi pada artikel.",
    });
  }

  const topIssues = analytics.slice(0, 3).map((item) => item.keyword);
  const urgentIssues = analytics.filter((item) => item.urgency === "Kritis" || item.urgency === "Tinggi");
  const priorityText = urgentIssues.length
    ? `Prioritas tindak lanjut: ${urgentIssues.slice(0, 2).map((item) => item.keyword).join(" dan ")}.`
    : "Belum ada isu berurgensi tinggi dari komentar yang masuk.";

  return NextResponse.json({
    summary: `Berdasarkan ${comments.length} komentar warga yang tercatat, isu yang paling sering muncul adalah ${topIssues.join(", ")}. ${priorityText}`,
  });
}
