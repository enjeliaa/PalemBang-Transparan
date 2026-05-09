import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    role?: "admin";
  }

  interface User {
    role?: "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin";
  }
}
