import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/infrastructure/database/client';
import { getCatalogoRepository, getPrecioInscripcionRepository, getTipoParticipanteRepository } from '@/infrastructure/config/container';
import { GrupoRapidoForm } from './GrupoRapidoForm';

export const metadata = {
  title: 'Registro Grupal | ANIEI 2026',
  description: 'Registra un grupo de participantes',
};

export default async function GrupoRegistroPage() {
  const session = await auth();
  const folioRegistro = (session?.user as any)?.folioRegistro;
  if (!folioRegistro) redirect('/login');

  const acceso = await prisma.accesos.findFirst({
    where: { folio_registro: folioRegistro },
    select: { folio_registro: true },
  });

  if (!acceso?.folio_registro) {
    redirect('/perfil');
  }

  const usuario = await prisma.usuarios.findUnique({
    where: { folio_registro: acceso.folio_registro },
    select: {
      nombre: true,
      apellido: true,
      correo: true,
      telefono: true,
      lada: true,
      extension: true,
      genero: true,
      carrera: true,
      dependencia: true,
      id_titulo: true,
      id_tipo_participante: true,
      id_institucion: true,
      id_entidad_federativa: true,
    },
  });

  if (!usuario) {
    redirect('/perfil');
  }

  const catalogoRepo = getCatalogoRepository();
  const precioRepo = getPrecioInscripcionRepository();
  const tipoParticipanteRepo = getTipoParticipanteRepository();

  const [titulos, estados, instituciones, precios, tiposParticipante] = await Promise.all([
    catalogoRepo.obtenerTitulos(),
    catalogoRepo.obtenerEstados(),
    catalogoRepo.obtenerInstituciones(),
    precioRepo.obtenerTodos(),
    tipoParticipanteRepo.obtenerTodos(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <GrupoRapidoForm
        responsable={usuario}
        catalogos={{ titulos, estados, instituciones }}
        precios={precios}
        tiposParticipante={tiposParticipante}
      />
    </div>
  );
}
