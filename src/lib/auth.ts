import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const fallbackEmail = "admin@palembang.go.id";
const fallbackPassword = "PalemBang#2026";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "Admin PalemBang",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase();
        const password = credentials?.password ?? "";
        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase() ?? fallbackEmail;
        const passwordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!email || !password) return null;

        if (email !== adminEmail) return null;

        if (passwordHash?.startsWith("$2")) {
          const valid = await bcrypt.compare(password, passwordHash);
          if (!valid) return null;
        } else if (password !== fallbackPassword) {
          return null;
        }

        return {
          id: "admin-palembang",
          name: "Admin Pemerintah Kota Palembang",
          email: adminEmail,
          role: "admin",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = "admin";
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = session.user.name ?? "Admin Pemerintah Kota Palembang";
        session.user.email = session.user.email ?? fallbackEmail;
      }
      return { ...session, role: token.role };
    },
  },
};
