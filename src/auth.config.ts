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
    authorized: async () => {
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.folioRegistro = user.folioRegistro;
        token.role = user.role?.toUpperCase() ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.folioRegistro = typeof token.folioRegistro === 'string' ? token.folioRegistro : undefined;
        session.user.role = typeof token.role === 'string' ? token.role : undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
