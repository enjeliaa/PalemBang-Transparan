import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";

export async function getCurrentSession() {
  return getServerSession(authOptions);
}

export async function isAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get("palembang_admin")?.value === "true") return true;

  const session = await getCurrentSession();
  return session?.role === "admin";
}
