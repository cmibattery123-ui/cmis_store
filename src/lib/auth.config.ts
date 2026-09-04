import type { NextAuthConfig } from "next-auth";

type Role = "ADMIN" | "CUSTOMER" | "DEALER";

export const authConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: { strategy: "jwt" },
  providers: [], // Providers added in auth.ts
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user.id as string) || "";
        token.role = (user as { role: Role }).role;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }

      if (trigger === "update" && session) {
        if (session.image !== undefined) token.image = session.image;
        if (session.name !== undefined) token.name = session.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string | null | undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
