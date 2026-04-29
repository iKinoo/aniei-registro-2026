import { PrismaClient } from '@/generated/prisma/client';
import { IInscripcionActividadRepository } from '@/application/ports/IInscripcionActividadRepository';
import { InscritoDTO } from '@/application/dtos/ActividadDTO';

export class PrismaInscripcionActividadRepository implements IInscripcionActividadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async obtenerPorActividad(idActividad: number): Promise<InscritoDTO[]> {
    const rows = await this.prisma.inscripcion_actividades.findMany({
      where: { id_actividad: idActividad },
      include: {
        usuarios: { select: { folio_registro: true, nombre: true, apellido: true, correo: true } },
      },
      orderBy: { fecha_inscripcion: 'asc' },
    });
    return rows.map((r) => ({
      folioRegistro: r.usuarios!.folio_registro,
      nombre: r.usuarios!.nombre,
      apellido: r.usuarios!.apellido,
      correo: r.usuarios!.correo,
      fechaInscripcion: r.fecha_inscripcion,
      urlConstancia: r.url_constancia,
    }));
  }

  async crearMuchas(folioRegistro: string, idsActividades: number[]): Promise<void> {
    if (idsActividades.length === 0) return;
    await this.prisma.inscripcion_actividades.createMany({
      data: idsActividades.map((idActividad) => ({
        folio_registro: folioRegistro,
        id_actividad: idActividad,
        fecha_inscripcion: new Date(),
      })),
      skipDuplicates: true,
    });
  }

  async obtenerIdsPorUsuario(folioRegistro: string): Promise<number[]> {
    const rows = await this.prisma.inscripcion_actividades.findMany({
      where: { folio_registro: folioRegistro },
      select: { id_actividad: true },
    });
    return rows.map((r) => r.id_actividad!).filter((id): id is number => id !== null);
  }

  /**
   * Inscribe al usuario en varias actividades con validación atómica de cupo.
   *
   * Por cada actividad:
   *   1. Abre una transacción independiente.
   *   2. Bloquea la fila de `actividades` con SELECT FOR UPDATE → serializa
   *      cualquier inscripción concurrente a esa misma actividad.
   *   3. Cuenta las inscripciones actuales dentro de la transacción bloqueada.
   *   4. Si hay cupo → inserta; si no → registra como sinCupo sin abortar las demás.
   *
   * Cada actividad es una transacción separada para que el fallo de una
   * no impida las demás (una actividad llena no bloquea las otras).
   */
  async crearMuchasConValidacion(
    folioRegistro: string,
    idsActividades: number[],
  ): Promise<{ ok: number[]; sinCupo: number[] }> {
    const ok: number[] = [];
    const sinCupo: number[] = [];

    for (const idActividad of idsActividades) {
      try {
        await this.prisma.$transaction(
          async (tx) => {
            // 1. Bloquear la fila de la actividad (SELECT FOR UPDATE)
            //    Esto serializa inscripciones concurrentes a la misma actividad.
            const [actividad] = await tx.$queryRaw<
              Array<{ cupo_maximo: number | null }>
            >`
              SELECT cupo_maximo
              FROM actividades
              WHERE id_actividad = ${idActividad}
              FOR UPDATE
            `;

            // Sin cupo_maximo o cupo_maximo = 0 → sin restricción
            if (!actividad || !actividad.cupo_maximo) {
              await tx.inscripcion_actividades.create({
                data: {
                  folio_registro: folioRegistro,
                  id_actividad: idActividad,
                  fecha_inscripcion: new Date(),
                },
              });
              return;
            }

            // 2. Contar inscritos dentro de la transacción (dato fresco + bloqueado)
            const [{ count }] = await tx.$queryRaw<Array<{ count: bigint }>>`
              SELECT COUNT(*)::bigint as count
              FROM inscripcion_actividades
              WHERE id_actividad = ${idActividad}
            `;

            if (Number(count) >= actividad.cupo_maximo) {
              // Cupo lleno → lanzar para marcarla como sinCupo
              throw new Error('SIN_CUPO');
            }

            await tx.inscripcion_actividades.create({
              data: {
                folio_registro: folioRegistro,
                id_actividad: idActividad,
                fecha_inscripcion: new Date(),
              },
            });
          },
          {
            // Timeout de 8s para no bloquear indefinidamente
            timeout: 8000,
          },
        );

        ok.push(idActividad);
      } catch (err) {
        // Solo marcamos sinCupo si es error de cupo; otros errores se re-lanzan
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'SIN_CUPO') {
          sinCupo.push(idActividad);
        } else {
          // Error inesperado (Unique constraint por doble inscripción, etc.) → ignorar silenciosamente
          console.warn(`inscripcion_actividades: error en id=${idActividad}:`, msg);
        }
      }
    }

    return { ok, sinCupo };
  }

  async actualizarUrlConstancia(idActividad: number, folioRegistro: string, url: string): Promise<void> {
    await this.prisma.inscripcion_actividades.update({
      where: {
        folio_registro_id_actividad: {
          folio_registro: folioRegistro,
          id_actividad: idActividad,
        },
      },
      data: {
        url_constancia: url,
      },
    });
  }
}
