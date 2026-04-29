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

  return (
    <div className="min-h-screen bg-slate-50">
      <RegistroForm
        catalogos={{ cargos, estados, instituciones, tiposUsuario }}
        actividades={actividades}
      />
    </div>
  );
}
