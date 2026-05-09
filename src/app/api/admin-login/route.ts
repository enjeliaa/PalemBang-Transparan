import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const fallbackEmail = "admin@palembang.go.id";
const fallbackPassword = "PalemBang#2026";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const adminEmail = (process.env.ADMIN_EMAIL ?? fallbackEmail).toLowerCase();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (email !== adminEmail) {
    return NextResponse.json({ error: "Email ini bukan admin pemerintah." }, { status: 401 });
  }

  let validPassword = password === fallbackPassword;

  if (passwordHash?.startsWith("$2")) {
    validPassword = await bcrypt.compare(password, passwordHash);
  }

  if (!validPassword) {
    return NextResponse.json({ error: "Password admin salah." }, { status: 401 });
  }

  const response = NextResponse.json({
    ok: true,
    role: "admin",
    email: adminEmail,
  });

  response.cookies.set("palembang_admin", "true", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
