import { getCatalogoRepository, getActividadRepository } from '@/infrastructure/config/container';
import { RegistroForm } from './components/RegistroForm';

export default async function RegistroPage() {
  const catalogoRepo = getCatalogoRepository();
  const actividadRepo = getActividadRepository();

  const [cargos, estados, instituciones, tiposUsuario, actividades] = await Promise.all([
    catalogoRepo.obtenerCargos(),
    catalogoRepo.obtenerEstados(),
    catalogoRepo.obtenerInstituciones(),
    catalogoRepo.obtenerTiposUsuario(),
    actividadRepo.listar(),
  ]);

  const catalogos = { cargos, estados, instituciones, tiposUsuario };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
      <RegistroForm catalogos={catalogos} actividades={actividades} />
    </div>
  );
}
