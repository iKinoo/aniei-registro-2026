-- DropForeignKey: equipos bloqueaba el borrado en cascada de actividades (RESTRICT)
ALTER TABLE `equipos` DROP FOREIGN KEY `equipos_id_actividad_fkey`;

-- AddForeignKey: al eliminar una actividad se eliminan sus equipos (y en cascada sus integrantes)
ALTER TABLE `equipos` ADD CONSTRAINT `equipos_id_actividad_fkey` FOREIGN KEY (`id_actividad`) REFERENCES `actividades`(`id_actividad`) ON DELETE CASCADE ON UPDATE NO ACTION;
