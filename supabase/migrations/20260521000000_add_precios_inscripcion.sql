-- Agrega tabla para gestionar precios de inscripción por fecha
-- El precio vigente se determina por la fecha_limite más reciente que sea <= NOW()

CREATE TABLE IF NOT EXISTS precios_inscripcion (
  id            SERIAL PRIMARY KEY,
  fecha_limite  TIMESTAMPTZ NOT NULL,
  costo         DECIMAL(10, 2) NOT NULL,
  costo_miembro DECIMAL(10, 2) NOT NULL DEFAULT 0,
  orden         INT NOT NULL DEFAULT 1,
  activo        BOOLEAN NOT NULL DEFAULT true
);

-- Seed: 3 niveles de precio por defecto
INSERT INTO precios_inscripcion (fecha_limite, costo, costo_miembro, orden, activo) VALUES
  ('2026-01-01 00:00:00-06', 1000.00, 1000.00, 1, true),
  ('2026-06-01 00:00:00-06', 2000.00, 2000.00, 2, true),
  ('2026-09-01 00:00:00-06', 3000.00, 3000.00, 3, true);
