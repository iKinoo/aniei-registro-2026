/*
  Migration: cpanel_auth
  Date: 2026-03-28
*/

-- Modificamos la tabla accesos
ALTER TABLE "accesos" DROP COLUMN "password_hash";
ALTER TABLE "accesos" RENAME COLUMN "username" TO "email";
ALTER TABLE "accesos" ALTER COLUMN "email" SET DATA TYPE VARCHAR(100);
ALTER TABLE "accesos" ADD COLUMN "nombre" VARCHAR(150);
ALTER TABLE "accesos" ADD COLUMN "auth_id" UUID UNIQUE;
