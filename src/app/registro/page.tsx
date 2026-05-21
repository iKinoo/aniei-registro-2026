import { getCatalogoRepository } from '@/infrastructure/config/container';
import { RegistroForm } from './components/RegistroForm';

export default async function RegistroPage() {
  const catalogoRepo = getCatalogoRepository();

  const [titulos, estados, instituciones] = await Promise.all([
    catalogoRepo.obtenerTitulos(),
    catalogoRepo.obtenerEstados(),
    catalogoRepo.obtenerInstituciones(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <RegistroForm
        catalogos={{ titulos, estados, instituciones }}
      />
    </div>
  );
}
