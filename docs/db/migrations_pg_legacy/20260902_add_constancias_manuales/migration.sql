CREATE TABLE "constancias_manuales" (
    "id_constancia" SERIAL NOT NULL,
    "tipo_constancia" VARCHAR(50) NOT NULL,
    "destinatarios" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "url_pdf" VARCHAR(500) NOT NULL,
    "fecha_generacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "constancias_manuales_pkey" PRIMARY KEY ("id_constancia")
);

CREATE INDEX "constancias_manuales_tipo_constancia_idx" ON "constancias_manuales"("tipo_constancia");
CREATE INDEX "constancias_manuales_fecha_generacion_idx" ON "constancias_manuales"("fecha_generacion");
