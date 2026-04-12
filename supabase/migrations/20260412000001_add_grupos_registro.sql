CREATE TABLE public.grupos_registro (
  id SERIAL PRIMARY KEY,
  token VARCHAR(100) UNIQUE NOT NULL,
  id_responsable INT NOT NULL REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
  fecha_registro TIMESTAMP(6) WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.usuarios
ADD COLUMN id_grupo_registro INT REFERENCES public.grupos_registro(id) ON DELETE SET NULL ON UPDATE CASCADE;

