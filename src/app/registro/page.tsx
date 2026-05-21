import { getCatalogoRepository, getPrecioInscripcionRepository } from '@/infrastructure/config/container';
import { RegistroForm } from './components/RegistroForm';

export default async function RegistroPage() {
  const catalogoRepo = getCatalogoRepository();
  const precioRepo = getPrecioInscripcionRepository();

  const [titulos, estados, instituciones, precios, precioVigente] = await Promise.all([
    catalogoRepo.obtenerTitulos(),
    catalogoRepo.obtenerEstados(),
    catalogoRepo.obtenerInstituciones(),
    precioRepo.obtenerTodos(),
    precioRepo.obtenerVigente(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <RegistroForm
        catalogos={{ titulos, estados, instituciones }}
        precios={precios}
        precioVigente={precioVigente}
      />
    </div>
  );
}
