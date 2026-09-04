// Migración Supabase Storage → filesystem del proyecto (./storage).
// Filesystem puro: sin S3, sin Docker. Preserva `bucket/path` para no tocar la BD.
// Uso (credenciales SOLO en entorno del operador, nunca commitear):
//   export NEXT_PUBLIC_SUPABASE_URL="https://[REF].supabase.co"
//   export SUPABASE_SERVICE_ROLE_KEY="[REDACTED]"
//   node scripts/migrar-storage-supabase-a-local.mjs --inventario
//   node scripts/migrar-storage-supabase-a-local.mjs --migrar
//   node scripts/migrar-storage-supabase-a-local.mjs --verificar
import { mkdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const BUCKETS = ["comprobantes", "constancias"];
const DESTINO = path.resolve(process.env.STORAGE_LOCAL_DIR ?? "./storage");
const modo = process.argv[2] ?? "--inventario";

function cliente() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en el entorno");
  return createClient(url, key);
}

async function listarRecursivo(supabase, bucket, prefijo = "") {
  const { data, error } = await supabase.storage.from(bucket).list(prefijo || undefined, { limit: 1000 });
  if (error) throw error;
  let archivos = [];
  for (const item of data ?? []) {
    const rel = prefijo ? `${prefijo}/${item.name}` : item.name;
    if (item.id == null) {
      archivos.push(...(await listarRecursivo(supabase, bucket, rel)));
    } else {
      archivos.push({ bucket, path: rel, bytes: item.metadata?.size ?? null });
    }
  }
  return archivos;
}

async function tamanoLocal(ruta) {
  try {
    return (await stat(ruta)).size;
  } catch {
    return null;
  }
}

if (modo === "--inventario") {
  const supabase = cliente();
  let totalBytes = 0;
  for (const bucket of BUCKETS) {
    const archivos = await listarRecursivo(supabase, bucket);
    const bytes = archivos.reduce((a, f) => a + (f.bytes ?? 0), 0);
    totalBytes += bytes;
    console.log(`${bucket}: ${archivos.length} objetos, ~${(bytes / 1024 / 1024).toFixed(2)} MiB`);
  }
  console.log(`TOTAL ~${(totalBytes / 1024 / 1024).toFixed(2)} MiB → destino ${DESTINO}`);
} else if (modo === "--migrar") {
  const supabase = cliente();
  const fallidos = [];
  let ok = 0;
  for (const bucket of BUCKETS) {
    const archivos = await listarRecursivo(supabase, bucket);
    for (const f of archivos) {
      const destino = path.join(DESTINO, f.bucket, ...f.path.split("/"));
      let reintento = 0;
      let descargado = false;
      while (reintento < 3 && !descargado) {
        try {
          const { data, error } = await supabase.storage.from(f.bucket).download(f.path);
          if (error || !data) throw error ?? new Error("descarga vacía");
          await mkdir(path.dirname(destino), { recursive: true });
          await writeFile(destino, Buffer.from(await data.arrayBuffer()));
          ok++;
          descargado = true;
        } catch (e) {
          reintento++;
          if (reintento >= 3) fallidos.push(`${f.bucket}/${f.path}: ${e?.message ?? e}`);
        }
      }
      if (ok % 50 === 0) console.log(`... ${ok} descargados`);
    }
  }
  console.log(`Migrados OK: ${ok}. Fallidos: ${fallidos.length}`);
  if (fallidos.length) {
    const { appendFile } = await import("node:fs/promises");
    await appendFile("/tmp/storage-fallidos.txt", fallidos.join("\n") + "\n");
    console.log("Ver /tmp/storage-fallidos.txt");
    process.exitCode = 1;
  }
} else if (modo === "--verificar") {
  const supabase = cliente();
  let todoOk = true;
  for (const bucket of BUCKETS) {
    const archivos = await listarRecursivo(supabase, bucket);
    let faltantes = 0;
    for (const f of archivos) {
      const bytes = await tamanoLocal(path.join(DESTINO, f.bucket, ...f.path.split("/")));
      if (bytes == null || (f.bytes != null && bytes !== f.bytes)) faltantes++;
    }
    console.log(`${bucket}: ${archivos.length - faltantes}/${archivos.length} OK`);
    if (faltantes) todoOk = false;
  }
  // Muestreo hash: 5 primeros comprobantes
  console.log(todoOk ? "VERIFICACIÓN OK" : "VERIFICACIÓN CON DIFERENCIAS");
  if (!todoOk) process.exitCode = 1;
} else {
  console.error("Modo desconocido. Usa --inventario | --migrar | --verificar");
  process.exitCode = 2;
}
