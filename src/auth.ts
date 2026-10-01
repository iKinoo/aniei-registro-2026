import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getAccesoRepository, getPasswordHasher } from '@/infrastructure/config/credenciales';
import { ValidarCredenciales } from '@/application/use-cases/ValidarCredenciales';
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

        const user = await new ValidarCredenciales(getAccesoRepository(), getPasswordHasher()).execute(folioRegistro, password);
        if (!user) return null;

        return {
          id: user.idAcceso.toString(),
          folioRegistro: user.folioRegistro,
          name: user.nombre,
          role: (user.rol ?? "USER").toUpperCase(),
        };
      },
    }),
  ],
});
