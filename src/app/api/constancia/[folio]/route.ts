import { NextRequest, NextResponse } from 'next/server';
import { getUsuarioRepository, getCatalogoRepository, getPdfService } from '@/infrastructure/config/container';
import { FolioRegistro } from '@/core/value-objects/FolioRegistro';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ folio: string }> },
) {
  try {
    const { folio } = await params;
    const folioVO = FolioRegistro.create(folio);

    const usuarioRepo = getUsuarioRepository();
    const usuario = await usuarioRepo.buscarPorFolio(folioVO);

    if (!usuario) {
      return NextResponse.json({ error: 'Folio no encontrado' }, { status: 404 });
    }

    const catalogoRepo = getCatalogoRepository();
    const [instituciones, tiposUsuario] = await Promise.all([
      catalogoRepo.obtenerInstituciones(),
      catalogoRepo.obtenerTiposUsuario(),
    ]);

    const institucion = instituciones.find((i) => i.idInstitucion === usuario.idInstitucion);
    const tipoUsuario = tiposUsuario.find((t) => t.idTipoUsuario === usuario.idTipoUsuario);

    const fechaStr = usuario.fechaRegistro.toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    const pdfService = getPdfService();
    const pdfBuffer = await pdfService.generarConstanciaInscripcion({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      folio,
      institucion: institucion?.nombre ?? 'N/A',
      tipoUsuario: tipoUsuario?.descripcion ?? 'N/A',
      fecha: fechaStr,
    });

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
