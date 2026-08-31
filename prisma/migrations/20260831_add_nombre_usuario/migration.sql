-- Agregar columna nombre_usuario a accesos
ALTER TABLE "accesos" ADD COLUMN "nombre_usuario" VARCHAR(50);

-- Poblar nombre_usuario con la parte antes del @ del email (en minúsculas, sin acentos)
UPDATE "accesos" 
SET "nombre_usuario" = LOWER(
  REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    SPLIT_PART("email", '@', 1),
    'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u')
)
WHERE "email" IS NOT NULL;

-- Manejar duplicados: agregar sufijo numérico aleatorio a los duplicados
-- Primero identificar duplicados y agregar sufijo
DO $$
DECLARE
  rec RECORD;
  nuevo_nombre VARCHAR(50);
  contador INT := 0;
BEGIN
  FOR rec IN 
    SELECT id_acceso, nombre_usuario, 
           ROW_NUMBER() OVER (PARTITION BY nombre_usuario ORDER BY id_acceso) as rn
    FROM accesos
    WHERE nombre_usuario IS NOT NULL
  LOOP
    IF rec.rn > 1 THEN
      -- Generar sufijo aleatorio de 2-3 dígitos
      nuevo_nombre := rec.nombre_usuario || (FLOOR(RANDOM() * 900 + 100))::TEXT;
      -- Verificar que no exista ya
      WHILE EXISTS (SELECT 1 FROM accesos WHERE nombre_usuario = nuevo_nombre) LOOP
        nuevo_nombre := rec.nombre_usuario || (FLOOR(RANDOM() * 900 + 100))::TEXT;
        contador := contador + 1;
        IF contador > 100 THEN
          RAISE EXCEPTION 'No se pudo generar nombre único para %', rec.nombre_usuario;
        END IF;
      END LOOP;
      UPDATE accesos SET nombre_usuario = nuevo_nombre WHERE id_acceso = rec.id_acceso;
    END IF;
  END LOOP;
END $$;

-- Hacer nombre_usuario NOT NULL
ALTER TABLE "accesos" ALTER COLUMN "nombre_usuario" SET NOT NULL;

-- Crear índice único para nombre_usuario
CREATE UNIQUE INDEX "accesos_nombre_usuario_key" ON "accesos"("nombre_usuario");

-- Hacer email nullable
ALTER TABLE "accesos" ALTER COLUMN "email" DROP NOT NULL;

-- Quitar constraint unique de usuarios.correo
ALTER TABLE "usuarios" DROP CONSTRAINT IF EXISTS "usuarios_correo_key";
