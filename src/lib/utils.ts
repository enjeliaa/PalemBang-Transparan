import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days === 1) return "kemarin";
  return `${days} hari lalu`;
}

export function budgetColor(progress: number) {
  if (progress >= 80) return "bg-[#2ECC71]";
  if (progress >= 40) return "bg-[#F39C12]";
  return "bg-[#E74C3C]";
}

export function statusLabel(status: string) {
  const labels = {
    planning: "Perencanaan",
    ongoing: "Sedang Berjalan",
    done: "Selesai",
  } as const;

  return labels[status as keyof typeof labels] ?? status;
}

export function statusClass(status: string) {
  const classes = {
    planning: "bg-zinc-200 text-zinc-800",
    ongoing: "bg-blue-100 text-blue-700",
    done: "bg-green-100 text-green-700",
  } as const;

  return classes[status as keyof typeof classes] ?? "bg-zinc-100 text-zinc-700";
}
