-- CreateTable
CREATE TABLE `accesos` (
    `id_acceso` INTEGER NOT NULL AUTO_INCREMENT,
    `folio_registro` VARCHAR(15) NOT NULL,
    `email` VARCHAR(100) NULL,
    `rol` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `nombre` VARCHAR(150) NULL,
    `auth_id` VARCHAR(36) NULL,
    `password` VARCHAR(255) NULL,

    UNIQUE INDEX `accesos_auth_id_key`(`auth_id`),
    INDEX `accesos_folio_registro_idx`(`folio_registro`),
    PRIMARY KEY (`id_acceso`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `actividad_ponentes` (
    `id_actividad` INTEGER NOT NULL,
    `folio_registro_ponente` VARCHAR(15) NOT NULL,
    `rol` VARCHAR(50) NULL,
    `url_constancia` VARCHAR(191) NULL,

    PRIMARY KEY (`id_actividad`, `folio_registro_ponente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `actividades` (
    `id_actividad` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(200) NOT NULL,
    `cupo_maximo` INTEGER NULL DEFAULT 0,
    `fecha_inicio` DATETIME(6) NOT NULL,
    `fecha_fin` DATETIME(6) NOT NULL,
    `id_tipo_actividad` INTEGER NULL,
    `id_institucion_sede` INTEGER NULL,
    `id_sala` INTEGER NULL DEFAULT 0,
    `costo` DECIMAL(10, 2) NULL DEFAULT 0,

    INDEX `actividades_id_tipo_actividad_idx`(`id_tipo_actividad`),
    INDEX `actividades_id_institucion_sede_idx`(`id_institucion_sede`),
    PRIMARY KEY (`id_actividad`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asistencia_actividades` (
    `id_asistencia` INTEGER NOT NULL AUTO_INCREMENT,
    `folio_registro` VARCHAR(15) NOT NULL,
    `id_actividad` INTEGER NULL,
    `fecha_hora_marcaje` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `asistencia_actividades_folio_registro_idx`(`folio_registro`),
    INDEX `asistencia_actividades_id_actividad_idx`(`id_actividad`),
    UNIQUE INDEX `asistencia_actividades_folio_registro_id_actividad_key`(`folio_registro`, `id_actividad`),
    PRIMARY KEY (`id_asistencia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cargos` (
    `id_cargo` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_cargo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `titulos` (
    `id_titulo` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_titulo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `depositos` (
    `id_deposito` INTEGER NOT NULL AUTO_INCREMENT,
    `folio_registro` VARCHAR(15) NOT NULL,
    `proposito` VARCHAR(50) NOT NULL DEFAULT 'EVENTO_PRINCIPAL',
    `banco_sucursal` VARCHAR(100) NULL,
    `ciudad` VARCHAR(100) NULL,
    `referencia` VARCHAR(50) NOT NULL,
    `monto` DECIMAL(10, 2) NOT NULL,
    `fecha_deposito` DATETIME(6) NOT NULL,
    `fecha_registro` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `archivo_url` VARCHAR(500) NOT NULL,
    `archivo_nombre` VARCHAR(255) NOT NULL,
    `archivo_mime` VARCHAR(100) NOT NULL,
    `archivo_tamanio` INTEGER NOT NULL,
    `notas` VARCHAR(500) NULL,

    INDEX `depositos_folio_registro_idx`(`folio_registro`),
    PRIMARY KEY (`id_deposito`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipo_integrantes` (
    `id_integrante` INTEGER NOT NULL AUTO_INCREMENT,
    `id_equipo` INTEGER NOT NULL,
    `folio_registro` VARCHAR(15) NOT NULL,
    `es_representante` BOOLEAN NOT NULL DEFAULT false,

    INDEX `equipo_integrantes_id_equipo_idx`(`id_equipo`),
    INDEX `equipo_integrantes_folio_registro_idx`(`folio_registro`),
    PRIMARY KEY (`id_integrante`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipos` (
    `id_equipo` INTEGER NOT NULL AUTO_INCREMENT,
    `id_actividad` INTEGER NOT NULL,
    `id_institucion` INTEGER NULL,
    `numero_equipo` INTEGER NOT NULL DEFAULT 1,
    `nombre_equipo` VARCHAR(150) NOT NULL,
    `fecha_registro` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (`id_equipo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estados` (
    `id_entidad_federativa` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_entidad_federativa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `facturaciones` (
    `id_facturacion` INTEGER NOT NULL AUTO_INCREMENT,
    `folio_registro` VARCHAR(15) NOT NULL,
    `razon_social` VARCHAR(150) NOT NULL,
    `rfc` VARCHAR(20) NOT NULL,
    `calle` VARCHAR(100) NULL,
    `num_exterior` VARCHAR(20) NULL,
    `num_interior` VARCHAR(20) NULL,
    `colonia` VARCHAR(100) NULL,
    `municipio` VARCHAR(100) NULL,
    `codigo_postal` VARCHAR(10) NULL,
    `id_entidad_federativa_rfc` INTEGER NULL,
    `constancia_url` VARCHAR(500) NULL,
    `constancia_nombre` VARCHAR(255) NULL,
    `constancia_mime` VARCHAR(100) NULL,
    `constancia_tamanio` INTEGER NULL,

    INDEX `facturaciones_folio_registro_idx`(`folio_registro`),
    PRIMARY KEY (`id_facturacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inscripcion_actividades` (
    `id_inscripcion` INTEGER NOT NULL AUTO_INCREMENT,
    `folio_registro` VARCHAR(15) NOT NULL,
    `id_actividad` INTEGER NULL,
    `fecha_inscripcion` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `url_constancia` VARCHAR(500) NULL,

    INDEX `inscripcion_actividades_folio_registro_idx`(`folio_registro`),
    INDEX `inscripcion_actividades_id_actividad_idx`(`id_actividad`),
    UNIQUE INDEX `inscripcion_actividades_folio_registro_id_actividad_key`(`folio_registro`, `id_actividad`),
    PRIMARY KEY (`id_inscripcion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instituciones` (
    `id_institucion` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,
    `abreviatura` VARCHAR(30) NULL,

    PRIMARY KEY (`id_institucion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipo_actividad` (
    `id_tipo_actividad` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(50) NOT NULL,
    `clave` VARCHAR(50) NULL,
    `maneja_equipos` BOOLEAN NULL DEFAULT false,
    `genera_constancia_participante` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id_tipo_actividad`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipo_usuario` (
    `id_tipo_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_tipo_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `folio_registro` VARCHAR(15) NOT NULL,
    `codigo_barras` VARCHAR(50) NULL,
    `nombre` VARCHAR(125) NOT NULL,
    `apellido` VARCHAR(256) NOT NULL,
    `correo` VARCHAR(100) NOT NULL,
    `telefono` VARCHAR(20) NULL,
    `lada` VARCHAR(10) NULL,
    `extension` VARCHAR(10) NULL,
    `genero` CHAR(1) NULL,
    `carrera` VARCHAR(128) NULL,
    `dependencia` VARCHAR(128) NULL,
    `id_titulo` INTEGER NULL,
    `id_tipo_usuario` INTEGER NULL,
    `id_tipo_participante` INTEGER NULL,
    `id_institucion` INTEGER NULL,
    `id_entidad_federativa` INTEGER NULL,
    `institucion_externa` VARCHAR(150) NULL,
    `verificado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_registro` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `id_grupo_registro` INTEGER NULL,

    UNIQUE INDEX `usuarios_codigo_barras_key`(`codigo_barras`),
    INDEX `usuarios_id_institucion_idx`(`id_institucion`),
    INDEX `usuarios_id_grupo_registro_idx`(`id_grupo_registro`),
    INDEX `usuarios_id_entidad_federativa_idx`(`id_entidad_federativa`),
    INDEX `usuarios_id_tipo_participante_idx`(`id_tipo_participante`),
    INDEX `usuarios_apellido_nombre_idx`(`apellido`, `nombre`),
    PRIMARY KEY (`folio_registro`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grupos_registro` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(100) NOT NULL,
    `folio_registro_responsable` VARCHAR(15) NOT NULL,
    `fecha_registro` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `grupos_registro_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipo_participante` (
    `id_tipo_participante` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(50) NOT NULL,
    `clave` VARCHAR(20) NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id_tipo_participante`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `precios_inscripcion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_tipo_participante` INTEGER NOT NULL,
    `es_afiliada` BOOLEAN NOT NULL DEFAULT true,
    `fecha_limite` DATETIME(6) NOT NULL,
    `costo` DECIMAL(10, 2) NOT NULL,
    `orden` INTEGER NOT NULL DEFAULT 1,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    INDEX `precios_inscripcion_id_tipo_participante_idx`(`id_tipo_participante`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `constancias_manuales` (
    `id_constancia` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo_constancia` VARCHAR(50) NOT NULL,
    `destinatarios` TEXT NOT NULL,
    `descripcion` TEXT NOT NULL,
    `url_pdf` VARCHAR(500) NOT NULL,
    `fecha_generacion` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `constancias_manuales_tipo_constancia_idx`(`tipo_constancia`),
    INDEX `constancias_manuales_fecha_generacion_idx`(`fecha_generacion`),
    PRIMARY KEY (`id_constancia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `folios_contador` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `creado_en` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `accesos` ADD CONSTRAINT `accesos_folio_registro_fkey` FOREIGN KEY (`folio_registro`) REFERENCES `usuarios`(`folio_registro`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `actividad_ponentes` ADD CONSTRAINT `actividad_ponentes_id_actividad_fkey` FOREIGN KEY (`id_actividad`) REFERENCES `actividades`(`id_actividad`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `actividad_ponentes` ADD CONSTRAINT `actividad_ponentes_folio_registro_ponente_fkey` FOREIGN KEY (`folio_registro_ponente`) REFERENCES `usuarios`(`folio_registro`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `actividades` ADD CONSTRAINT `actividades_id_institucion_sede_fkey` FOREIGN KEY (`id_institucion_sede`) REFERENCES `instituciones`(`id_institucion`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `actividades` ADD CONSTRAINT `actividades_id_tipo_actividad_fkey` FOREIGN KEY (`id_tipo_actividad`) REFERENCES `tipo_actividad`(`id_tipo_actividad`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `asistencia_actividades` ADD CONSTRAINT `asistencia_actividades_id_actividad_fkey` FOREIGN KEY (`id_actividad`) REFERENCES `actividades`(`id_actividad`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `asistencia_actividades` ADD CONSTRAINT `asistencia_actividades_folio_registro_fkey` FOREIGN KEY (`folio_registro`) REFERENCES `usuarios`(`folio_registro`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `depositos` ADD CONSTRAINT `depositos_folio_registro_fkey` FOREIGN KEY (`folio_registro`) REFERENCES `usuarios`(`folio_registro`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `equipo_integrantes` ADD CONSTRAINT `equipo_integrantes_id_equipo_fkey` FOREIGN KEY (`id_equipo`) REFERENCES `equipos`(`id_equipo`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `equipo_integrantes` ADD CONSTRAINT `equipo_integrantes_folio_registro_fkey` FOREIGN KEY (`folio_registro`) REFERENCES `usuarios`(`folio_registro`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `equipos` ADD CONSTRAINT `equipos_id_actividad_fkey` FOREIGN KEY (`id_actividad`) REFERENCES `actividades`(`id_actividad`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `equipos` ADD CONSTRAINT `equipos_id_institucion_fkey` FOREIGN KEY (`id_institucion`) REFERENCES `instituciones`(`id_institucion`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `facturaciones` ADD CONSTRAINT `facturaciones_id_entidad_federativa_rfc_fkey` FOREIGN KEY (`id_entidad_federativa_rfc`) REFERENCES `estados`(`id_entidad_federativa`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `facturaciones` ADD CONSTRAINT `facturaciones_folio_registro_fkey` FOREIGN KEY (`folio_registro`) REFERENCES `usuarios`(`folio_registro`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inscripcion_actividades` ADD CONSTRAINT `inscripcion_actividades_id_actividad_fkey` FOREIGN KEY (`id_actividad`) REFERENCES `actividades`(`id_actividad`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inscripcion_actividades` ADD CONSTRAINT `inscripcion_actividades_folio_registro_fkey` FOREIGN KEY (`folio_registro`) REFERENCES `usuarios`(`folio_registro`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_id_entidad_federativa_fkey` FOREIGN KEY (`id_entidad_federativa`) REFERENCES `estados`(`id_entidad_federativa`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_id_grupo_registro_fkey` FOREIGN KEY (`id_grupo_registro`) REFERENCES `grupos_registro`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_id_institucion_fkey` FOREIGN KEY (`id_institucion`) REFERENCES `instituciones`(`id_institucion`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_id_tipo_participante_fkey` FOREIGN KEY (`id_tipo_participante`) REFERENCES `tipo_participante`(`id_tipo_participante`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_id_tipo_usuario_fkey` FOREIGN KEY (`id_tipo_usuario`) REFERENCES `tipo_usuario`(`id_tipo_usuario`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_id_titulo_fkey` FOREIGN KEY (`id_titulo`) REFERENCES `titulos`(`id_titulo`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `grupos_registro` ADD CONSTRAINT `grupos_registro_folio_registro_responsable_fkey` FOREIGN KEY (`folio_registro_responsable`) REFERENCES `usuarios`(`folio_registro`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `precios_inscripcion` ADD CONSTRAINT `precios_inscripcion_id_tipo_participante_fkey` FOREIGN KEY (`id_tipo_participante`) REFERENCES `tipo_participante`(`id_tipo_participante`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- D-5: identificadores de seguridad sensibles a mayúsculas/minúsculas.
-- NO aplicar a columnas que participan en FK (errno 150).
ALTER TABLE `grupos_registro` MODIFY `token` VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL;
ALTER TABLE `accesos` MODIFY `auth_id` VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL;
ALTER TABLE `usuarios` MODIFY `codigo_barras` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL;
