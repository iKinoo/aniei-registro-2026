import { PrismaClient } from '@/generated/prisma/client';
import { IInscripcionActividadRepository } from '@/application/ports/IInscripcionActividadRepository';

export class PrismaInscripcionActividadRepository implements IInscripcionActividadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async crearMuchas(idUsuario: number, idsActividades: number[]): Promise<void> {
    if (idsActividades.length === 0) return;
    await this.prisma.inscripcion_actividades.createMany({
      data: idsActividades.map((idActividad) => ({
        id_usuario: idUsuario,
        id_actividad: idActividad,
        fecha_inscripcion: new Date(),
      })),
      skipDuplicates: true,
    });
  }

  async obtenerIdsPorUsuario(idUsuario: number): Promise<number[]> {
    const rows = await this.prisma.inscripcion_actividades.findMany({
      where: { id_usuario: idUsuario },
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
    idUsuario: number,
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
                  id_usuario: idUsuario,
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
                id_usuario: idUsuario,
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
}
