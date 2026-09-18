import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: async ({ auth }) => {
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.folioRegistro = (user as any).folioRegistro;
        token.role = ((user as any).role as string)?.toUpperCase() ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        (session.user as any).folioRegistro = token.folioRegistro;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
