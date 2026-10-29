-- AlterTable: selección persistente de participantes para constancias
ALTER TABLE `inscripcion_actividades` ADD COLUMN `incluir_en_constancia` BOOLEAN NOT NULL DEFAULT true;
