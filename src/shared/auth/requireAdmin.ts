import { auth } from "@/auth";
import { getAccesoRepository } from "@/infrastructure/config/container";

export async function requireAdmin(): Promise<{ folioRegistro: string; acceso: import("@/core/entities/Acceso").Acceso }> {
  const session = await auth();
  const folioRegistro = (session?.user as any)?.folioRegistro;
  if (!folioRegistro) {
    throw new Error("UNAUTHORIZED");
  }
  const acceso = await getAccesoRepository().buscarPorFolioRegistro(folioRegistro);
  if (!acceso || acceso.rol.toUpperCase() !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return { folioRegistro: acceso.folioRegistro, acceso };
}

export async function requireUser(): Promise<{ folioRegistro: string; acceso: import("@/core/entities/Acceso").Acceso }> {
  const session = await auth();
  const folioRegistro = (session?.user as any)?.folioRegistro;
  if (!folioRegistro) {
    throw new Error("UNAUTHORIZED");
  }
  const acceso = await getAccesoRepository().buscarPorFolioRegistro(folioRegistro);
  if (!acceso) {
    throw new Error("UNAUTHORIZED");
  }
  return { folioRegistro: acceso.folioRegistro, acceso };
}
