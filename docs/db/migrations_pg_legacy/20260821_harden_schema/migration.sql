-- P0-4 Hardening: indices, NOT NULL, Rol enum, onDelete Restrict, verificado non-nullable
-- Generated from AUDITORIA.md D-01..D-06

-- 1. Crear enum Rol
DO $$ BEGIN
  CREATE TYPE "Rol" AS ENUM ('USER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Migrar columna rol String -> Rol enum
ALTER TABLE "accesos" ALTER COLUMN "rol" DROP DEFAULT;
ALTER TABLE "accesos" ALTER COLUMN "rol" TYPE "Rol" USING ("rol"::text::"Rol");
ALTER TABLE "accesos" ALTER COLUMN "rol" SET DEFAULT 'USER'::"Rol";

-- 2. folio_registro NOT NULL en hijos (tras limpiar huérfanos)
-- Opcional: limpiar huérfanos antes: UPDATE depositos SET folio_registro='ANI26-0000' WHERE folio_registro IS NULL;
ALTER TABLE "depositos" ALTER COLUMN "folio_registro" SET NOT NULL;
ALTER TABLE "facturaciones" ALTER COLUMN "folio_registro" SET NOT NULL;
ALTER TABLE "inscripcion_actividades" ALTER COLUMN "folio_registro" SET NOT NULL;
ALTER TABLE "asistencia_actividades" ALTER COLUMN "folio_registro" SET NOT NULL;
ALTER TABLE "asistencia_actividades" ALTER COLUMN "fecha_hora_marcaje" SET NOT NULL;
ALTER TABLE "asistencia_actividades" ALTER COLUMN "fecha_hora_marcaje" SET DEFAULT NOW();

-- 3. verificado y fecha_registro non-nullable
ALTER TABLE "usuarios" ALTER COLUMN "verificado" SET NOT NULL;
ALTER TABLE "usuarios" ALTER COLUMN "verificado" SET DEFAULT false;
ALTER TABLE "usuarios" ALTER COLUMN "fecha_registro" SET NOT NULL;
ALTER TABLE "usuarios" ALTER COLUMN "fecha_registro" SET DEFAULT NOW();

-- 4. equipo_integrantes es_representante non-nullable
ALTER TABLE "equipo_integrantes" ALTER COLUMN "es_representante" SET NOT NULL;
ALTER TABLE "equipo_integrantes" ALTER COLUMN "es_representante" SET DEFAULT false;

-- 5. Índices FK
CREATE INDEX IF NOT EXISTS "idx_accesos_folio" ON "accesos"("folio_registro");
CREATE INDEX IF NOT EXISTS "idx_depositos_folio" ON "depositos"("folio_registro");
CREATE INDEX IF NOT EXISTS "idx_facturaciones_folio" ON "facturaciones"("folio_registro");
CREATE INDEX IF NOT EXISTS "idx_inscripcion_folio" ON "inscripcion_actividades"("folio_registro");
CREATE INDEX IF NOT EXISTS "idx_inscripcion_actividad" ON "inscripcion_actividades"("id_actividad");
CREATE INDEX IF NOT EXISTS "idx_asistencia_folio" ON "asistencia_actividades"("folio_registro");
CREATE INDEX IF NOT EXISTS "idx_asistencia_actividad" ON "asistencia_actividades"("id_actividad");
CREATE INDEX IF NOT EXISTS "idx_usuarios_institucion" ON "usuarios"("id_institucion");
CREATE INDEX IF NOT EXISTS "idx_usuarios_grupo" ON "usuarios"("id_grupo_registro");
CREATE INDEX IF NOT EXISTS "idx_usuarios_entidad" ON "usuarios"("id_entidad_federativa");
CREATE INDEX IF NOT EXISTS "idx_actividades_tipo" ON "actividades"("id_tipo_actividad");
CREATE INDEX IF NOT EXISTS "idx_actividades_sede" ON "actividades"("id_institucion_sede");
CREATE INDEX IF NOT EXISTS "idx_equipo_integrantes_equipo" ON "equipo_integrantes"("id_equipo");
CREATE INDEX IF NOT EXISTS "idx_equipo_integrantes_folio" ON "equipo_integrantes"("folio_registro");

-- 6. pg_trgm para búsqueda insensible
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS "idx_usuarios_search_trgm" ON "usuarios" USING GIN ((nombre || ' ' || apellido || ' ' || correo) gin_trgm_ops);

-- 7. Secuencia folio (si no existe)
DO $$ BEGIN
  CREATE SEQUENCE IF NOT EXISTS usuarios_folio_seq OWNED BY usuarios.folio_registro;
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 8. onDelete Restrict para trazabilidad financiera (requiere dropear y recrear FKs)
-- Nota: los nombres de constraints varían por migración; este bloque es plantilla.
-- ALTER TABLE "depositos" DROP CONSTRAINT "depositos_folio_registro_fkey";
-- ALTER TABLE "depositos" ADD CONSTRAINT "depositos_folio_registro_fkey" FOREIGN KEY ("folio_registro") REFERENCES "usuarios"("folio_registro") ON DELETE RESTRICT ON UPDATE CASCADE;
-- Repetir para facturaciones, inscripcion_actividades, equipo_integrantes.usuarios
