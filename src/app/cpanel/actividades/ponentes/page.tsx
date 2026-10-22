import Link from 'next/link';
import { getPonentesResumenAction } from './actions';
import PonentesResumenClient from './PonentesResumenClient';

export const metadata = {
  title: 'Ponentes | CPanel ANIEI',
};

export default async function PonentesPage() {
  const res = await getPonentesResumenAction();

  if (!res.success) {
    return (
      <div className="p-8 text-center text-slate-500">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{res.error}</p>
        <Link href="/cpanel/actividades" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-4 inline-block">
          ← Volver a actividades
        </Link>
      </div>
    );
  }

  return <PonentesResumenClient ponentes={res.data} />;
}
