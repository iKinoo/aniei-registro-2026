import { PrepararRegistro } from '@/application/use-cases/PrepararRegistro';
import { getCatalogoRepository, getPrecioInscripcionRepository, getTipoParticipanteRepository } from '@/infrastructure/config/container';
import { RegistroForm } from './components/RegistroForm';

export default async function RegistroPage() {
  const { catalogos, precios, tiposParticipante } = await new PrepararRegistro(getCatalogoRepository(),
    getPrecioInscripcionRepository(), getTipoParticipanteRepository()).execute();

  return (
    <div className="min-h-full bg-background">
      <RegistroForm
        catalogos={catalogos}
        precios={precios}
        tiposParticipante={tiposParticipante}
      />
    </div>
  );
}
