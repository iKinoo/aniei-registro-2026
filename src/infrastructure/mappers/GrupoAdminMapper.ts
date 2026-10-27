import type { Prisma, depositos, grupos_registro, usuarios } from '@/generated/prisma/client';
import type { GrupoForAdminDTO } from '@/application/dtos/GrupoForAdminDTO';

export const GRUPO_ADMIN_INCLUDE = {
  responsable: {
    include: {
      depositos: {
        where: { proposito: 'GRUPO_RAPIDO' },
        orderBy: { id_deposito: 'desc' },
      },
    },
  },
  miembros: {
    select: {
      folio_registro: true,
      nombre: true,
      apellido: true,
      correo: true,
      carrera: true,
    },
    orderBy: { folio_registro: 'asc' },
  },
} satisfies Prisma.grupos_registroInclude;

type GrupoConRelaciones = grupos_registro & {
  responsable: Pick<usuarios, 'folio_registro' | 'nombre' | 'apellido' | 'correo'> & {
    depositos: depositos[];
  };
  miembros: Pick<usuarios, 'folio_registro' | 'nombre' | 'apellido' | 'correo' | 'carrera'>[];
};

export function mapGrupoAdmin(grupo: GrupoConRelaciones): GrupoForAdminDTO {
  const deposito = grupo.responsable.depositos.find((candidato) => {
    const nombreArchivo = candidato.archivo_url.split('?')[0].split('/').pop() ?? '';
    return candidato.proposito === 'GRUPO_RAPIDO'
      && nombreArchivo.slice(0, nombreArchivo.lastIndexOf('.')) === grupo.token;
  });

  return {
    id: grupo.id,
    fechaRegistro: grupo.fecha_registro,
    responsable: {
      folioRegistro: grupo.responsable.folio_registro,
      nombreCompleto: `${grupo.responsable.nombre} ${grupo.responsable.apellido}`,
      correo: grupo.responsable.correo,
    },
    miembros: grupo.miembros.map((miembro) => ({
      folioRegistro: miembro.folio_registro,
      nombreCompleto: `${miembro.nombre} ${miembro.apellido}`,
      correo: miembro.correo,
      carrera: miembro.carrera,
    })),
    deposito: deposito ? {
      monto: Number(deposito.monto),
      fecha: deposito.fecha_deposito,
      referencia: deposito.referencia,
      archivoNombre: deposito.archivo_nombre,
      archivoRuta: deposito.archivo_url,
    } : null,
  };
}
