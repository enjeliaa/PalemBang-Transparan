import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PalemBang - Palembang Terbuka, Palembang Maju",
  description: "Portal resmi transparansi pembangunan, anggaran, dan aspirasi warga Kota Palembang.",
  openGraph: {
    title: "PalemBang",
    description: "Pantau pembangunan dan APBD fasilitas publik Kota Palembang secara terbuka.",
    images: ["ampera0.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full bg-[#F8F8F8] text-[#1A1A2E]">{children}</body>
    </html>
  );
}
