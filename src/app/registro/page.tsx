import { getCatalogoRepository, getPrecioInscripcionRepository, getTipoParticipanteRepository } from '@/infrastructure/config/container';
import { RegistroForm } from './components/RegistroForm';

export default async function RegistroPage() {
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
      <RegistroForm
        catalogos={{ titulos, estados, instituciones }}
        precios={precios}
        tiposParticipante={tiposParticipante}
      />
    </div>
  );
}
