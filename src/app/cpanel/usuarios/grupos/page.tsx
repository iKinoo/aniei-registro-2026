import { getGruposAdminAction } from './actions';
import { GruposAdminClient } from './GruposAdminClient';

export const metadata = { title: 'Grupos | CPanel ANIEI 2026' };

export default async function GruposPage() {
  const initialRes = await getGruposAdminAction(1, 10);
  const initialData = initialRes.success ? initialRes.data : null;

  return <GruposAdminClient initialData={initialData} initialError={initialRes.success ? null : initialRes.error} />;
}
