-- Eliminar restricción unique de referencia en la tabla depositos
ALTER TABLE depositos DROP CONSTRAINT IF EXISTS depositos_referencia_key;
