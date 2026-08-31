import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/infrastructure/database/client";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        folioRegistro: { label: "Folio de Registro", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.folioRegistro || !credentials?.password) {
          return null;
        }

        const folioRegistro = credentials.folioRegistro as string;
        const password = credentials.password as string;

        const user = await prisma.accesos.findFirst({
          where: { folio_registro: folioRegistro },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id_acceso.toString(),
          folioRegistro: user.folio_registro,
          name: user.nombre,
          role: (user.rol ?? "USER").toUpperCase(),
        };
      },
    }),
  ],
});
