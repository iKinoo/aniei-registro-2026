import { ReportesClient } from './ReportesClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Reportes - CPanel',
};

export default function ReportesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ReportesClient />
    </div>
  );
}
