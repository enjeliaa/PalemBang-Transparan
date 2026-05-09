import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    summary:
      "Keluhan warga minggu ini paling banyak berkaitan dengan drainase, penerangan, antrean layanan, dan fasilitas taman. Prioritas tindak lanjut disarankan pada area yang berdampak langsung pada akses sekolah, pasar, dan layanan administrasi.",
  });
}
