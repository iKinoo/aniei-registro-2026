import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/auth";
import { prisma } from "@/infrastructure/database/client";
import { verificarFirma } from "@/infrastructure/services/storage/LocalFilesystemStorageService";

const MIME_POR_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function resolverBaseDir(): string {
  return path.resolve(process.env.STORAGE_LOCAL_DIR ?? "./storage");
}

function rutaSegura(segmentos: string[]): string | null {
  const ruta = segmentos.join("/");
  if (!ruta || ruta.includes("\0")) return null;
  const normalizada = path.posix.normalize(ruta);
  if (normalizada === ".." || normalizada.startsWith("../") || normalizada.includes("/../")) return null;
  const destino = path.resolve(resolverBaseDir(), ...normalizada.split("/"));
  const relativo = path.relative(resolverBaseDir(), destino);
  if (relativo === ".." || relativo.startsWith(`..${path.sep}`) || path.isAbsolute(relativo)) return null;
  return ruta;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segmentos } = await params;
  const ruta = rutaSegura(segmentos ?? []);
  const exp = request.nextUrl.searchParams.get("exp") ?? "";
  const sig = request.nextUrl.searchParams.get("sig") ?? "";
  const secret = process.env.STORAGE_URL_SECRET ?? "";

  if (!ruta || !secret || !verificarFirma(ruta, exp, sig, secret)) {
    const expirada = exp && Number(exp) * 1000 < Date.now();
    return NextResponse.json(
      { error: expirada ? "Enlace expirado" : "No autorizado" },
      { status: expirada ? 410 : 401 },
    );
  }

  const session = await auth();
  const sessionUser = session?.user as unknown as
    | { folioRegistro?: string; role?: string }
    | undefined;
  const folioRegistro = sessionUser?.folioRegistro;
  if (!folioRegistro) {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  }
  const role = (sessionUser?.role ?? "USER").toUpperCase();
  const esPropiaConstancia = ruta === `constancias/${folioRegistro}.pdf`;

  if (role !== "ADMIN" && !esPropiaConstancia) {
    const deposito = await prisma.depositos.findFirst({
      where: { folio_registro: folioRegistro, archivo_url: ruta },
      select: { id_deposito: true },
    });
    if (!deposito) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
  }

  try {
    const buffer = await readFile(path.resolve(resolverBaseDir(), ...ruta.split("/")));
    const ext = (ruta.split(".").pop() ?? "").toLowerCase();
    const nombre = ruta.split("/").pop() ?? "archivo";
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": MIME_POR_EXTENSION[ext] ?? "application/octet-stream",
        "Content-Disposition": `inline; filename="${nombre}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }
}
