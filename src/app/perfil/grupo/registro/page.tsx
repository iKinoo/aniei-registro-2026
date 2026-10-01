import { PrepararRegistro } from '@/application/use-cases/PrepararRegistro';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getRegistroQueryService } from '@/infrastructure/config/container';
import { ConsultarRegistros } from '@/application/use-cases/ConsultarRegistros';
import { getCatalogoRepository, getPrecioInscripcionRepository, getTipoParticipanteRepository } from '@/infrastructure/config/container';
import { GrupoRapidoForm } from './GrupoRapidoForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Registro Grupal | ANIEI 2026',
  description: 'Registra un grupo de participantes',
};

export default async function GrupoRegistroPage() {
  const session = await auth();
  const folioRegistro = session?.user?.folioRegistro;
  if (!folioRegistro) redirect('/login');

  const usuario = await new ConsultarRegistros(getRegistroQueryService()).obtenerUsuario(folioRegistro);
  if (!usuario) redirect('/perfil');

  const { catalogos, precios, tiposParticipante } = await new PrepararRegistro(getCatalogoRepository(),
    getPrecioInscripcionRepository(), getTipoParticipanteRepository()).execute();

  return (
    <div className="min-h-screen bg-slate-50">
      <GrupoRapidoForm
        responsable={usuario}
        catalogos={catalogos}
        precios={precios}
        tiposParticipante={tiposParticipante}
      />
    </div>
  );
}
