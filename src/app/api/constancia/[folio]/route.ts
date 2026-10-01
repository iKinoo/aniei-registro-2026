import { NextRequest, NextResponse } from 'next/server';
import { getUsuarioRepository, getCatalogoRepository, getPdfService } from '@/infrastructure/config/container';
import { ConsultarConstancia } from '@/application/use-cases/ConsultarConstancia';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ folio: string }> },
) {
  try {
    const { folio } = await params;
    const pdfBuffer = await new ConsultarConstancia(getUsuarioRepository(), getCatalogoRepository(), getPdfService()).descargar(folio);
    if (!pdfBuffer) return NextResponse.json({ error: 'Folio no encontrado' }, { status: 404 });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="constancia-${folio}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Error al generar constancia' }, { status: 500 });
  }
}
