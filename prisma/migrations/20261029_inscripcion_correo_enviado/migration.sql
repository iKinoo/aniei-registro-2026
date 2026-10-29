-- AlterTable: seguimiento de constancias enviadas por correo
ALTER TABLE `inscripcion_actividades` ADD COLUMN `correo_enviado` BOOLEAN NOT NULL DEFAULT false;
