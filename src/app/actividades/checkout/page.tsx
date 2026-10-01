import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { requireUser } from '@/shared/auth/requireAdmin';
import { ConsultarFacturacion } from '@/application/use-cases/ConsultarFacturacion';
import { getActividadesPorIdsAction, getEstadosCheckoutAction } from '../checkout/actions';
import { getFacturacionRepository } from '@/infrastructure/config/container';
import CheckoutClient from './CheckoutClient';
import type { FacturacionDefaults } from '@/app/registro/components/SeccionFacturacion';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Checkout de Actividades | ANIEI 2026' };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const session = await auth();
  const folioRegistro = session?.user?.folioRegistro;
  if (!folioRegistro) redirect('/login');

  const params = await searchParams;
  const ids = (params.ids ?? '')
    .split(',')
    .map(Number)
    .filter((n) => !isNaN(n) && n > 0);

  if (ids.length === 0) redirect('/actividades');

  await requireUser();

  // Cargar la facturación previa del usuario (si existe)
  let facturacionDefaults: FacturacionDefaults | undefined;
  if (folioRegistro) {
    try {
      const facturacion = await new ConsultarFacturacion(getFacturacionRepository()).buscarPorUsuario(folioRegistro);
      if (facturacion) {
        facturacionDefaults = {
          razonSocial:          facturacion.razonSocial,
          rfc:                  facturacion.rfc,
          calle:                facturacion.calle ?? undefined,
          numExterior:          facturacion.numExterior ?? undefined,
          numInterior:          facturacion.numInterior ?? undefined,
          colonia:              facturacion.colonia ?? undefined,
          municipio:            facturacion.municipio ?? undefined,
          codigoPostal:         facturacion.codigoPostal ?? undefined,
          idEntidadFederativaRfc: facturacion.idEntidadFederativaRfc
            ? String(facturacion.idEntidadFederativaRfc)
            : undefined,
        };
      }
    } catch {
      // Si falla la carga de facturación, continuamos sin defaults
    }
  }

  const [actRes, estadosRes] = await Promise.all([
    getActividadesPorIdsAction(ids),
    getEstadosCheckoutAction(),
  ]);

  const actividades = actRes.success ? actRes.data : [];
  const estados = estadosRes.success ? estadosRes.data : [];

  if (actividades.length === 0) redirect('/actividades');

  return (
    <CheckoutClient
      actividades={actividades}
      estados={estados}
      facturacionDefaults={facturacionDefaults}
    />
  );
}
