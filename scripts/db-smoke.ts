import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL no está configurada');
  process.exit(1);
}

const u = new URL(url);
const adapter = new PrismaMariaDb({
  host: u.hostname,
  port: u.port ? Number(u.port) : 3306,
  user: decodeURIComponent(u.username),
  password: decodeURIComponent(u.password),
  database: u.pathname.replace(/^\//, ''),
  connectionLimit: 1,
  acquireTimeout: 5000,
  idleTimeout: 30,
  connectTimeout: 5000,
  timezone: 'Z',
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Smoke test de conexión MySQL...');

  const versionResult = await prisma.$queryRaw<Array<{ version: string }>>`SELECT VERSION() as version`;
  console.log('MySQL versión:', versionResult[0].version);

  const tzResult = await prisma.$queryRaw<Array<{ tz: string; now: Date; utc: Date }>>`SELECT @@session.time_zone as tz, NOW() as now, UTC_TIMESTAMP() as utc`;
  console.log('Zona horaria sesión:', tzResult[0].tz);
  console.log('NOW():', tzResult[0].now);
  console.log('UTC_TIMESTAMP():', tzResult[0].utc);

  const collationResult = await prisma.$queryRaw<Array<{ collation: string }>>`SELECT @@collation_database as collation`;
  console.log('Collation BD:', collationResult[0].collation);

  const testDate = new Date('2026-06-15T12:30:45.123Z');
  await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS _smoke_test (id INT PRIMARY KEY, fecha DATETIME(6))`;
  await prisma.$executeRaw`INSERT INTO _smoke_test (id, fecha) VALUES (1, ${testDate}) ON DUPLICATE KEY UPDATE fecha = ${testDate}`;
  const rowResult = await prisma.$queryRaw<Array<{ fecha: Date }>>`SELECT fecha FROM _smoke_test WHERE id = 1`;
  console.log('Fecha insertada:', testDate.toISOString());
  console.log('Fecha leída:', rowResult[0].fecha.toISOString?.() || rowResult[0].fecha);

  const diff = Math.abs(testDate.getTime() - new Date(rowResult[0].fecha).getTime());
  if (diff < 1000) {
    console.log('OK: Fechas UTC correctas (dif < 1s)');
  } else {
    console.error('ERROR: Desfase de fechas:', diff, 'ms');
    process.exit(1);
  }

  await prisma.$executeRaw`DROP TABLE _smoke_test`;
  console.log('Smoke test completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('Error en smoke test:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
