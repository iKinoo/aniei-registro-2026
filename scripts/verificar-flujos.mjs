import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { verificarArquitectura } from './check-architecture.mjs';

const root = path.resolve('src');
const nativeRequire = createRequire(import.meta.url);
const cache = new Map();
function load(name, from = root) {
  const resolved = name.startsWith('@/') ? path.join(root, name.slice(2)) : name.startsWith('.') ? path.resolve(from, name) : null;
  if (!resolved) return nativeRequire(name);
  const file = resolved.endsWith('.ts') ? resolved : `${resolved}.ts`;
  if (cache.has(file)) return cache.get(file).exports;
  const loadedModule = { exports: {} };
  cache.set(file, loadedModule);
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const execute = vm.runInThisContext(`(function(require, module, exports) {${source}\n})`, { filename: file });
  execute(specifier => load(specifier, path.dirname(file)), loadedModule, loadedModule.exports);
  return loadedModule.exports;
}
const { RegistrarUsuario } = load('@/application/use-cases/RegistrarUsuario');
const { RegistrarGrupoRapido } = load('@/application/use-cases/RegistrarGrupoRapido');
const { ConfirmarInscripciones } = load('@/application/use-cases/ConfirmarInscripciones');
const { AutorizarArchivo } = load('@/application/use-cases/AutorizarArchivo');
const { DescargarArchivo } = load('@/application/use-cases/DescargarArchivo');
const { ValidarCredenciales } = load('@/application/use-cases/ValidarCredenciales');
const { GestionarUsuarios } = load('@/application/use-cases/GestionarUsuarios');
const { PrismaUsuarioRepository } = load('@/infrastructure/repositories/PrismaUsuarioRepository');
const { PrismaInscripcionActividadRepository } = load('@/infrastructure/repositories/PrismaInscripcionActividadRepository');
const { mapPrismaError } = load('@/infrastructure/errors/prismaErrorMapper');
const { HmacEnlaceArchivoService } = load('@/infrastructure/services/storage/HmacEnlaceArchivoService');
const { LocalFilesystemStorageService } = load('@/infrastructure/services/storage/LocalFilesystemStorageService');
const catalogos = { obtenerInstituciones: async () => [], obtenerTitulos: async () => [] };
const hasher = { hash: async p => `hash:${p}`, verify: async (p, h) => h === `hash:${p}` };
const passwords = { generar: () => 'ClaveDePrueba123' };
const ids = { uuid: () => 'id-prueba' };
const archivo = { nombre: 'pago.pdf', mime: 'application/pdf', tamanio: 3, buffer: new Uint8Array([1, 2, 3]) };
const deposito = { referencia: 'prueba', monto: 100, fechaDeposito: new Date('2026-09-30') };
const dto = { nombre: 'Ana', apellido: 'Pérez', correo: 'ana@example.com', genero: 'F', idTitulo: 1,
  idTipoParticipante: 1, idInstitucion: null, idEntidadFederativa: 1, deposito, archivo };
function storage() {
  const files = new Map();
  const eliminados = [];
  return { files, eliminados,
    subir: async (ruta, buffer) => { files.set(ruta, buffer); return ruta; },
    eliminar: async ruta => { eliminados.push(ruta); files.delete(ruta); },
    descargar: async ruta => files.get(ruta),
  };
}
const usuario = { nombre: 'Ana', apellido: 'Pérez', correo: { toString: () => 'ana@example.com' }, idInstitucion: null, idEntidadFederativa: 1 };
const actividades = { obtenerPorId: async id => ({ idActividad: id, nombre: `Actividad ${id}`, costo: 100, fechaInicio: '2026-10-01T10:00:00Z' }) };
const usuarios = { buscarPorId: async () => usuario };
const email = { enviarConfirmacionActividades: async () => {}, enviarConfirmacionRegistro: async () => {}, enviarConfirmacionGrupoRapido: async () => {} };

await test('Registro individual compensa ambos archivos si la transacción falla', async () => {
  const disk = storage();
  const registro = new RegistrarUsuario(disk, email, {}, catalogos, hasher, ids, passwords, { run: async () => { throw new Error('rollback'); } });
  await assert.rejects(registro.execute({ ...dto, facturacion: { razonSocial: 'Prueba', rfc: 'AAA010101AAA', archivoConstancia: archivo } }), /rollback/);
  assert.equal(disk.files.size, 0);
  assert.equal(disk.eliminados.length, 2);
});
await test('Registro compensa el comprobante si falla la segunda subida', async () => {
  const disk = storage();
  const subir = disk.subir;
  disk.subir = async (ruta, buffer) => { if (ruta.includes('/constancias/')) throw new Error('subida'); return subir(ruta, buffer); };
  const registro = new RegistrarUsuario(disk, email, {}, catalogos, hasher, ids, passwords, { run: async () => assert.fail('No debe iniciar transacción') });
  await assert.rejects(registro.execute({ ...dto, facturacion: { razonSocial: 'Prueba', rfc: 'AAA010101AAA', archivoConstancia: archivo } }), /subida/);
  assert.equal(disk.files.size, 0);
});
await test('Registro confirmado sigue siendo exitoso si falla generar PDF', async () => {
  const disk = storage();
  let enviado = false;
  const ctx = { usuarioRepo: { crear: async () => ({ folioRegistro: 'ANI26-0001' }) }, accesoRepo: { crear: async () => {} }, depositoRepo: { crear: async () => {} } };
  const registro = new RegistrarUsuario(disk, { enviarConfirmacionRegistro: async () => { enviado = true; } },
    { generarConstanciaInscripcion: async () => { throw new Error('PDF'); } }, catalogos, hasher, ids, passwords, { run: async fn => fn(ctx) });
  const result = await registro.execute(dto);
  assert.equal(result.folio, 'ANI26-0001');
  assert.equal(enviado, true);
  assert.equal(disk.files.size, 1);
});
await test('Grupo conserva correspondencia contraseña/miembro cuando los hashes terminan fuera de orden', async () => {
  let next = 0;
  let mapped;
  const enviados = [];
  const ctx = { depositoRepo: { crear: async () => {} }, usuarioRepo: { crearGrupo: async d => { mapped = d.miembros; return { folios: ['ANI26-0002', 'ANI26-0003'], usuariosIds: ['ANI26-0002', 'ANI26-0003'] }; } } };
  const registro = new RegistrarGrupoRapido(usuarios, storage(), { ...email, enviarConfirmacionRegistro: async (correo, datos) => enviados.push({ correo, datos }) },
    { hash: async p => { if (p === 'clave-1') await new Promise(resolve => setTimeout(resolve, 10)); return `hash:${p}`; } },
    ids, { generar: () => `clave-${++next}` }, { run: async fn => fn(ctx) });
  await registro.execute({ responsableId: 'ANI26-0001', deposito, archivo, miembros: [
    { nombre: 'Uno', apellido: 'Prueba', correo: 'uno@example.com' }, { nombre: 'Dos', apellido: 'Prueba', correo: 'dos@example.com' },
  ] });
  assert.equal(mapped[0].passwordHash, `hash:${enviados[0].datos.password}`);
  assert.equal(mapped[1].passwordHash, `hash:${enviados[1].datos.password}`);
});
await test('Repositorio grupal utiliza el cliente transaccional sin abrir otra transacción', async () => {
  let created = 0;
  const tx = { grupos_registro: { create: async () => ({ id: 1 }) }, folios_contador: { create: async () => ({ id: 2 }) },
    usuarios: { create: async () => { created++; return { folio_registro: 'ANI26-0002' }; } }, accesos: { create: async () => {} } };
  const repo = new PrismaUsuarioRepository(tx, {});
  const result = await repo.crearGrupo({ token: 'token', responsableId: 'ANI26-0001', institucionId: null,
    dependenciaId: '', estadoId: 1, miembros: [{ nombre: 'Uno', apellido: 'Prueba', correo: 'uno@example.com', passwordHash: 'hash', idTipoParticipante: 1 }] });
  assert.equal(created, 1);
  assert.deepEqual(result.folios, ['ANI26-0002']);
});
await test('Inscripciones bloquean actividades en orden y propagan errores de persistencia', async () => {
  const locks = [];
  const tx = { $queryRaw: async (_strings, id) => { locks.push(id); return [{ cupo_maximo: 1 }]; },
    inscripcion_actividades: { findUnique: async () => null, count: async () => 0, create: async () => {} } };
  const repo = new PrismaInscripcionActividadRepository(tx);
  assert.deepEqual(await repo.crearMuchasConValidacion('ANI26-0001', [2, 1, 2]), { ok: [1, 2], sinCupo: [] });
  assert.deepEqual(locks, [1, 2]);
  tx.inscripcion_actividades.create = async () => { throw new Error('BD'); };
  await assert.rejects(repo.crearMuchasConValidacion('ANI26-0001', [1]), /BD/);
});
await test('Checkout revierte todas las inscripciones y compensa archivo si una actividad no tiene cupo', async () => {
  const disk = storage();
  let confirmado = false;
  let pagos = 0;
  const ctx = { inscripcionRepo: { obtenerIdsPorUsuario: async () => [], crearMuchasConValidacion: async () => ({ ok: [1], sinCupo: [2] }) }, depositoRepo: { crear: async () => { pagos++; } } };
  const tx = { run: async fn => { const result = await fn(ctx); confirmado = true; return result; } };
  const checkout = new ConfirmarInscripciones(actividades, usuarios, tx, disk, email, ids);
  await assert.rejects(checkout.execute('ANI26-0001', { idsActividades: [1, 2], deposito, archivo }), /Sin cupo/);
  assert.equal(confirmado, false);
  assert.equal(pagos, 0);
  assert.equal(disk.files.size, 0);
});
await test('Checkout no confía en la omisión del comprobante para actividades con costo', async () => {
  const checkout = new ConfirmarInscripciones(actividades, usuarios, { run: async () => assert.fail('No debe persistir') }, storage(), email, ids);
  await assert.rejects(checkout.execute('ANI26-0001', { idsActividades: [1] }), /comprobante/);
});
await test('Checkout exitoso confirma depósito/facturación y luego envía correo', async () => {
  const orden = [];
  const ctx = { inscripcionRepo: { obtenerIdsPorUsuario: async () => [], crearMuchasConValidacion: async () => ({ ok: [1], sinCupo: [] }) },
    depositoRepo: { crear: async () => orden.push('deposito') }, facturacionRepo: { crear: async () => orden.push('factura') } };
  const tx = { run: async fn => { const res = await fn(ctx); orden.push('commit'); return res; } };
  const checkout = new ConfirmarInscripciones(actividades, usuarios, tx, storage(), { enviarConfirmacionActividades: async () => orden.push('correo') }, ids);
  const result = await checkout.execute('ANI26-0001', { idsActividades: [1], deposito, archivo, facturacion: { razonSocial: 'Prueba', rfc: 'AAA010101AAA' } });
  assert.equal(result.success, true);
  assert.deepEqual(orden, ['deposito', 'factura', 'commit', 'correo']);
});
await test('Archivo exige propietario o administrador y rechaza cuentas inexistentes', async () => {
  let admin = false;
  const accesos = { buscarPorFolioRegistro: async () => ({ folioRegistro: 'ANI26-0001', isAdmin: () => admin }) };
  const auth = { getCurrentSession: async () => ({ folioRegistro: 'ANI26-0001' }) };
  const autorizar = new AutorizarArchivo(auth, accesos, { buscarTodosPorUsuario: async () => [{ archivoUrl: 'comprobantes/propio.pdf' }] });
  await autorizar.execute('comprobantes/propio.pdf');
  await autorizar.execute('constancias/ANI26-0001.pdf');
  await assert.rejects(autorizar.execute('comprobantes/ajeno.pdf'), /No autorizado/);
  admin = true;
  await autorizar.execute('comprobantes/ajeno.pdf');
  accesos.buscarPorFolioRegistro = async () => null;
  await assert.rejects(autorizar.execute('comprobantes/ajeno.pdf'), /Sesión inválida/);
});
await test('Filesystem firma, descarga y bloquea traversal, firma alterada y enlaces vencidos', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aniei-arch-test-'));
  const secret = 'clave-de-prueba-de-mas-de-32-caracteres';
  try {
    const disk = new LocalFilesystemStorageService(dir, secret);
    await disk.subir('comprobantes/prueba.pdf', archivo.buffer, archivo.mime);
    const url = new URL(await disk.getAccess({ bucket: 'comprobantes', path: 'prueba.pdf' }), 'http://localhost');
    const exp = url.searchParams.get('exp');
    const sig = url.searchParams.get('sig');
    const enlaces = new HmacEnlaceArchivoService(secret);
    assert.equal(enlaces.validar('comprobantes/prueba.pdf', exp, sig), 'VALIDO');
    assert.equal(enlaces.validar('../prueba.pdf', exp, sig), 'INVALIDO');
    assert.equal(enlaces.validar('comprobantes/prueba.pdf', exp, '0'.repeat(64)), 'INVALIDO');
    assert.equal(enlaces.validar('comprobantes/prueba.pdf', '1', sig), 'EXPIRADO');
    assert.deepEqual(new Uint8Array(await disk.descargar('comprobantes/prueba.pdf')), archivo.buffer);
    await assert.rejects(disk.descargar('../prueba.pdf'), /traversal/);
    const descargar = new DescargarArchivo(disk, {}, {}, {}, enlaces);
    await assert.rejects(descargar.execute('comprobantes/prueba.pdf', '1', sig), /expirado/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
await test('Credenciales se validan mediante repositorio y hasher inyectados', async () => {
  const acceso = { folioRegistro: 'ANI26-0001' };
  const validar = new ValidarCredenciales({ obtenerCredenciales: async () => ({ acceso, passwordHash: 'hash:correcta' }) }, hasher);
  assert.equal(await validar.execute('ANI26-0001', 'incorrecta'), null);
  assert.equal(await validar.execute('ANI26-0001', 'correcta'), acceso);
});
await test('Eliminar usuario no borra archivos si falla la transacción', async () => {
  const disk = storage();
  const gestionar = new GestionarUsuarios({ run: async () => { throw new Error('rollback'); } }, disk);
  await assert.rejects(gestionar.eliminar('ANI26-0001'), /rollback/);
  assert.deepEqual(disk.eliminados, []);
});
await test('Errores Prisma se traducen aunque el driver use causa y target string', () => {
  assert.equal(mapPrismaError({ cause: { code: 'P2002', meta: { target: 'usuarios_correo_key' } } }).code, 'CORREO_DUPLICADO');
  assert.equal(mapPrismaError({ cause: { code: 'P2034' } }).code, 'TX_CONFLICTO');
  assert.equal(mapPrismaError(null), null);
});

await test('Control de arquitectura rechaza imports estáticos, de tipos y dinámicos hacia infraestructura', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aniei-limites-test-'));
  try {
    fs.mkdirSync(path.join(dir, 'application'));
    fs.mkdirSync(path.join(dir, 'infrastructure'));
    fs.writeFileSync(path.join(dir, 'infrastructure', 'Adapter.ts'), 'export class Adapter {}');
    for (const source of ["import type { Adapter } from '../infrastructure/Adapter';", "import { Adapter } from '@/infrastructure/Adapter';", "const adapter = import('@/infrastructure/Adapter');"]) {
      fs.writeFileSync(path.join(dir, 'application', 'Caso.ts'), source);
      const result = verificarArquitectura(dir);
      assert.ok(result.errors.length);
      assert.match(result.errors.join('\n'), /Dependencia no permitida/);
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
await test('Control detecta adaptadores transitivos en Client Components y permite frontera de Server Actions', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aniei-client-test-'));
  try {
    for (const folder of ['app', 'shared', 'infrastructure/config']) fs.mkdirSync(path.join(dir, folder), { recursive: true });
    fs.writeFileSync(path.join(dir, 'app', 'Client.tsx'), "'use client';\nimport { action } from './actions';");
    fs.writeFileSync(path.join(dir, 'app', 'actions.ts'), "import { value } from '@/shared/bridge'; export const action = value;");
    fs.writeFileSync(path.join(dir, 'shared', 'bridge.ts'), "import { value } from '@/infrastructure/config/container'; export { value };");
    fs.writeFileSync(path.join(dir, 'infrastructure/config', 'container.ts'), 'export const value = 1;');
    let result = verificarArquitectura(dir);
    assert.ok(result.errors.length);
    assert.match(result.errors.join('\n'), /Client Component/);
    fs.writeFileSync(path.join(dir, 'app', 'actions.ts'), "'use server';\nimport { value } from '@/infrastructure/config/container'; export async function action() { return value; }");
    result = verificarArquitectura(dir);
    assert.deepEqual(result.errors, []);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
