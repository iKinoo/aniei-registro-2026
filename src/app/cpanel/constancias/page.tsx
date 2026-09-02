import { ConstanciasManualesClient } from './ConstanciasManualesClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Constancias Manuales - CPanel',
};

export default function ConstanciasManualesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ConstanciasManualesClient />
    </div>
  );
}
