-- Create tipo_participante table
CREATE TABLE "tipo_participante" (
    "id_tipo_participante" SERIAL PRIMARY KEY,
    "descripcion" VARCHAR(50) NOT NULL,
    "clave" VARCHAR(20),
    "orden" INTEGER NOT NULL DEFAULT 0
);

-- Insert initial data
INSERT INTO "tipo_participante" ("descripcion", "clave", "orden") VALUES
('Alumno', 'ALUMNO', 1),
('Académico', 'ACADEMICO', 2),
('Ponente', 'PONENTE', 3);

-- Add columns to usuarios
ALTER TABLE "usuarios" ADD COLUMN "id_tipo_participante" INTEGER;
ALTER TABLE "usuarios" ADD COLUMN "institucion_externa" VARCHAR(150);
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_tipo_participante_fkey"
    FOREIGN KEY ("id_tipo_participante") REFERENCES "tipo_participante"("id_tipo_participante");

CREATE INDEX IF NOT EXISTS "idx_usuarios_tipo_participante" ON "usuarios"("id_tipo_participante");

-- Drop old precios_inscripcion and recreate with new structure
DROP TABLE "precios_inscripcion";

CREATE TABLE "precios_inscripcion" (
    "id" SERIAL PRIMARY KEY,
    "id_tipo_participante" INTEGER NOT NULL,
    "es_afiliada" BOOLEAN NOT NULL DEFAULT true,
    "fecha_limite" TIMESTAMP(6) NOT NULL,
    "costo" DECIMAL(10,2) NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 1,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "precios_inscripcion_id_tipo_participante_fkey"
        FOREIGN KEY ("id_tipo_participante") REFERENCES "tipo_participante"("id_tipo_participante")
);

CREATE INDEX IF NOT EXISTS "idx_precios_tipo_participante" ON "precios_inscripcion"("id_tipo_participante");

-- Insert official prices
-- Alumno Afiliada (id_tipo_participante = 1)
INSERT INTO "precios_inscripcion" ("id_tipo_participante", "es_afiliada", "fecha_limite", "costo", "orden") VALUES
(1, true, '2026-01-01 00:00:00', 400.00, 1),
(1, true, '2026-09-20 00:00:00', 450.00, 2);

-- Alumno No Afiliada
INSERT INTO "precios_inscripcion" ("id_tipo_participante", "es_afiliada", "fecha_limite", "costo", "orden") VALUES
(1, false, '2026-01-01 00:00:00', 450.00, 1),
(1, false, '2026-09-20 00:00:00', 500.00, 2);

-- Académico Afiliada (id_tipo_participante = 2)
INSERT INTO "precios_inscripcion" ("id_tipo_participante", "es_afiliada", "fecha_limite", "costo", "orden") VALUES
(2, true, '2026-01-01 00:00:00', 550.00, 1),
(2, true, '2026-09-20 00:00:00', 600.00, 2);

-- Académico No Afiliada
INSERT INTO "precios_inscripcion" ("id_tipo_participante", "es_afiliada", "fecha_limite", "costo", "orden") VALUES
(2, false, '2026-01-01 00:00:00', 600.00, 1),
(2, false, '2026-09-20 00:00:00', 650.00, 2);

-- Ponente Afiliada (id_tipo_participante = 3)
INSERT INTO "precios_inscripcion" ("id_tipo_participante", "es_afiliada", "fecha_limite", "costo", "orden") VALUES
(3, true, '2026-01-01 00:00:00', 2780.00, 1),
(3, true, '2026-09-20 00:00:00', 3150.00, 2);

-- Ponente No Afiliada
INSERT INTO "precios_inscripcion" ("id_tipo_participante", "es_afiliada", "fecha_limite", "costo", "orden") VALUES
(3, false, '2026-01-01 00:00:00', 3150.00, 1),
(3, false, '2026-09-20 00:00:00', 3700.00, 2);
