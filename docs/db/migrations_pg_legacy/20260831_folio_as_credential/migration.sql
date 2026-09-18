-- Hacer folio_registro NOT NULL
ALTER TABLE "accesos" ALTER COLUMN "folio_registro" SET NOT NULL;

-- Eliminar índice único de nombre_usuario
DROP INDEX IF EXISTS "accesos_nombre_usuario_key";

-- Eliminar columna nombre_usuario
ALTER TABLE "accesos" DROP COLUMN "nombre_usuario";
