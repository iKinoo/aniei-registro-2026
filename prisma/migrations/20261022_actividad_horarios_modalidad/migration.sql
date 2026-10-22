-- AlterTable: modalidad y enlace de sesión
ALTER TABLE `actividades` ADD COLUMN `modalidad` ENUM('PRESENCIAL', 'VIRTUAL') NOT NULL DEFAULT 'PRESENCIAL';
ALTER TABLE `actividades` ADD COLUMN `enlace_sesion` VARCHAR(500) NULL;

-- AlterTable: id_sala de INT a VARCHAR(100) (mismo nombre de columna)
ALTER TABLE `actividades` MODIFY `id_sala` VARCHAR(100) NULL;
UPDATE `actividades` SET `id_sala` = NULL WHERE `id_sala` = '0';

-- CreateTable
CREATE TABLE `actividad_horarios` (
    `id_horario` INTEGER NOT NULL AUTO_INCREMENT,
    `id_actividad` INTEGER NOT NULL,
    `fecha_inicio` DATETIME(6) NOT NULL,
    `fecha_fin` DATETIME(6) NOT NULL,

    PRIMARY KEY (`id_horario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Backfill: un horario por actividad a partir del rango existente
INSERT INTO `actividad_horarios` (`id_actividad`, `fecha_inicio`, `fecha_fin`)
SELECT `id_actividad`, `fecha_inicio`, `fecha_fin` FROM `actividades`;

-- CreateIndex
CREATE INDEX `actividad_horarios_id_actividad_idx` ON `actividad_horarios`(`id_actividad`);

-- AddForeignKey
ALTER TABLE `actividad_horarios` ADD CONSTRAINT `actividad_horarios_id_actividad_fkey` FOREIGN KEY (`id_actividad`) REFERENCES `actividades`(`id_actividad`) ON DELETE CASCADE ON UPDATE NO ACTION;
