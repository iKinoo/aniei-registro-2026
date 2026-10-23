-- AlterTable: bandera de actividad (soft-delete reversible)
ALTER TABLE `actividades` ADD COLUMN `activo` BOOLEAN NOT NULL DEFAULT true;
