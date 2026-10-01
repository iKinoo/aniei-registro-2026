import { PrepararRegistro } from '@/application/use-cases/PrepararRegistro';
import { getCatalogoRepository, getPrecioInscripcionRepository, getTipoParticipanteRepository } from '@/infrastructure/config/container';
import { RegistroForm } from './components/RegistroForm';

export const dynamic = 'force-dynamic';

export default async function RegistroPage() {
  const { catalogos, precios, tiposParticipante } = await new PrepararRegistro(getCatalogoRepository(),
    getPrecioInscripcionRepository(), getTipoParticipanteRepository()).execute();

  return (
    <div className="min-h-screen bg-slate-50">
      <RegistroForm
        catalogos={catalogos}
        precios={precios}
        tiposParticipante={tiposParticipante}
      />
    </div>
  );
}
