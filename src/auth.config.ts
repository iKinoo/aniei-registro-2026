import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // Los providers con Prisma se configuran en auth.ts
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: async ({ auth }) => {
      // Proxy maneja la redirección; authorized permite pasar al proxy.
      // Si hay sesión, está autorizado a nivel framework; RBAC específico está en proxy y requireAdmin().
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = ((user as any).role as string)?.toUpperCase() ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
