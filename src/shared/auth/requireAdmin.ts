import { auth } from "@/auth";
import { getAccesoRepository } from "@/infrastructure/config/container";

export async function requireAdmin(): Promise<{ email: string; acceso: import("@/core/entities/Acceso").Acceso }> {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("UNAUTHORIZED");
  }
  const acceso = await getAccesoRepository().buscarPorEmail(session.user.email);
  if (!acceso || acceso.rol.toUpperCase() !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return { email: acceso.email, acceso };
}

export async function requireUser(): Promise<{ email: string; acceso: import("@/core/entities/Acceso").Acceso }> {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("UNAUTHORIZED");
  }
  const acceso = await getAccesoRepository().buscarPorEmail(session.user.email);
  if (!acceso) {
    throw new Error("UNAUTHORIZED");
  }
  return { email: acceso.email, acceso };
}
