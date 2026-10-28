import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHmac } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { gunzipSync } from 'node:zlib';
import ts from 'typescript';
import { verificarArquitectura } from './check-architecture.mjs';

process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

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
const { DescargarConstanciasTalleristas } = load('@/application/use-cases/DescargarConstanciasTalleristas');
const { PrismaUsuarioRepository } = load('@/infrastructure/repositories/PrismaUsuarioRepository');
const { PrismaAdminQueryService } = load('@/infrastructure/services/PrismaAdminQueryService');
const { PrismaRegistroQueryService } = load('@/infrastructure/services/PrismaRegistroQueryService');
const { mapGrupoAdmin } = load('@/infrastructure/mappers/GrupoAdminMapper');
const { PrismaInscripcionActividadRepository } = load('@/infrastructure/repositories/PrismaInscripcionActividadRepository');
const { mapPrismaError } = load('@/infrastructure/errors/prismaErrorMapper');
const { HmacEnlaceArchivoService } = load('@/infrastructure/services/storage/HmacEnlaceArchivoService');
const { LocalFilesystemStorageService } = load('@/infrastructure/services/storage/LocalFilesystemStorageService');
const { CompletarDatosRegistro } = load('@/application/use-cases/CompletarDatosRegistro');
const { RegistrarPagoRegistro } = load('@/application/use-cases/RegistrarPagoRegistro');
const { ObtenerPerfilRegistro } = load('@/application/use-cases/ObtenerPerfilRegistro');
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
const actividades = { obtenerPorId: async id => ({ idActividad: id, nombre: `Actividad ${id}`, costo: 100, fechaInicio: '2026-10-01T10:00:00Z', activo: true }) };
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
await test('Registro individual no envía notificaciones hasta notificar y sobrevive a PDF fallido', async () => {
  const disk = storage();
  let enviado = false;
  const ctx = { usuarioRepo: { crear: async () => ({ folioRegistro: 'ANI26-0001' }) }, accesoRepo: { crear: async () => {} }, depositoRepo: { crear: async () => {} }, facturacionRepo: { crear: async () => {} }, inscripcionRepo: { crearMuchasConValidacion: async () => {} } };
  const registro = new RegistrarUsuario(disk, { enviarConfirmacionRegistro: async () => { enviado = true; } },
    { generarConstancia: async () => { throw new Error('PDF'); } }, catalogos, hasher, ids, passwords, { run: async fn => fn(ctx) });
  const result = await registro.execute(dto);
  assert.equal(result.folio, 'ANI26-0001');
  assert.equal(enviado, false);
  assert.equal(disk.files.size, 1);
  await registro.notificar(result.notificacion);
  assert.equal(enviado, true);
  assert.equal(disk.files.size, 1);
});
await test('notificar individual propaga el fallo del correo de credenciales', async () => {
  const disk = storage();
  const datos = { nombre: 'Ana', apellido: 'Pérez', correo: 'ana@example.com', folio: 'ANI26-0001', institucion: 'UdeG', fecha: 'hoy', password: 'x' };
  const registro = new RegistrarUsuario(disk, { enviarConfirmacionRegistro: async () => { throw new Error('SMTP'); } },
    { generarConstancia: async () => new Uint8Array([1]) }, catalogos, hasher, ids, passwords, { run: async () => {} });
  await assert.rejects(registro.notificar(datos), /SMTP/);
});
await test('Grupo conserva correspondencia contraseña/miembro cuando los hashes terminan fuera de orden', async () => {
  let next = 0;
  let mapped;
  const ctx = { depositoRepo: { crear: async () => {} }, usuarioRepo: { crearGrupo: async d => { mapped = d.miembros; return { folios: ['ANI26-0002', 'ANI26-0003'], usuariosIds: ['ANI26-0002', 'ANI26-0003'] }; } } };
  const registro = new RegistrarGrupoRapido(usuarios, storage(), email,
    { hash: async p => { if (p === 'clave-1') await new Promise(resolve => setTimeout(resolve, 10)); return `hash:${p}`; } },
    ids, { generar: () => `clave-${++next}` }, { run: async fn => fn(ctx) });
  const result = await registro.execute({ responsableId: 'ANI26-0001', deposito, archivo, miembros: [
    { nombre: 'Uno', apellido: 'Prueba', correo: 'uno@example.com' }, { nombre: 'Dos', apellido: 'Prueba', correo: 'dos@example.com' },
  ] });
  assert.equal(mapped[0].passwordHash, `hash:${result.notificacion.miembros[0].password}`);
  assert.equal(mapped[1].passwordHash, `hash:${result.notificacion.miembros[1].password}`);
});
await test('notificar grupal resume los correos que no pudieron enviarse', async () => {
  const disk = storage();
  const datos = {
    miembros: [
      { nombre: 'Uno', apellido: 'Prueba', correo: 'uno@example.com', folio: 'ANI26-0002', institucion: '1', fecha: 'hoy', password: 'x' },
      { nombre: 'Dos', apellido: 'Prueba', correo: 'dos@example.com', folio: 'ANI26-0003', institucion: '1', fecha: 'hoy', password: 'y' },
    ],
    responsableNombre: 'Ana', responsableApellido: 'Pérez', responsableCorreo: 'ana@example.com', token: 'tok', totalMiembros: 2,
  };
  const fallados = new Set(['dos@example.com']);
  const registro = new RegistrarGrupoRapido(usuarios, disk, {
    enviarConfirmacionRegistro: async correo => { if (fallados.has(correo)) throw new Error('SMTP'); },
    enviarConfirmacionGrupoRapido: async () => {},
  }, hasher, ids, passwords, { run: async () => assert.fail('No debe iniciar transacción') });
  await assert.rejects(registro.notificar(datos), /dos@example\.com/);
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
await test('Consulta administrativa distingue los depósitos de varios grupos del mismo responsable', async () => {
  const depositoAnterior = { proposito: 'GRUPO_RAPIDO', monto: '900.00', fecha_deposito: new Date('2026-10-01'),
    referencia: 'grupo-uno', archivo_nombre: 'primero.pdf', archivo_url: 'comprobantes_grupo/token-uno.pdf' };
  const depositoReciente = { ...depositoAnterior, monto: '1353.00', referencia: 'grupo-dos',
    archivo_nombre: 'segundo.jpg', archivo_url: 'https://storage.example.com/comprobantes/comprobantes_grupo/token-dos.jpg?exp=123' };
  const responsable = { folio_registro: 'ANI26-0001', nombre: 'Ana', apellido: 'Pérez', correo: 'ana@example.com',
    depositos: [depositoReciente, depositoAnterior] };
  const grupo = { id: 1, token: 'token-uno', fecha_registro: new Date('2026-10-01'), responsable,
    miembros: [{ folio_registro: 'ANI26-0002', nombre: 'Luis', apellido: 'Pérez', correo: 'luis@example.com', carrera: null }] };
  const primero = mapGrupoAdmin(grupo);
  const segundo = mapGrupoAdmin({ ...grupo, id: 2, token: 'token-dos' });
  assert.equal(primero.deposito.referencia, 'grupo-uno');
  assert.equal(primero.deposito.monto, 900);
  assert.equal(segundo.deposito.referencia, 'grupo-dos');
  assert.equal(segundo.deposito.monto, 1353);
  assert.equal(primero.responsable.folioRegistro, 'ANI26-0001');
  assert.deepEqual(primero.miembros.map(miembro => miembro.folioRegistro), ['ANI26-0002']);
  assert.equal(mapGrupoAdmin({ ...grupo, token: 'sin-comprobante' }).deposito, null);
  assert.equal(mapGrupoAdmin({ ...grupo, responsable: { ...responsable,
    depositos: [{ ...depositoAnterior, proposito: 'EVENTO_PRINCIPAL' }] } }).deposito, null);
});
await test('Búsqueda administrativa incluye folios de miembros y pagina con orden estable', async () => {
  let consulta;
  let filtro;
  const servicio = new PrismaAdminQueryService({ grupos_registro: {
    count: async ({ where }) => { filtro = where; return 21; },
    findMany: async argumentos => { consulta = argumentos; return []; },
  } });
  const resultado = await servicio.obtenerGruposForAdmin(2, 10, 'ANI26-0002');
  assert.equal(consulta.skip, 10);
  assert.equal(consulta.take, 10);
  assert.deepEqual(consulta.orderBy, [{ fecha_registro: 'desc' }, { id: 'desc' }]);
  assert.ok(filtro.OR.some(condicion => condicion.miembros?.some?.folio_registro?.contains === 'ANI26-0002'));
  assert.deepEqual(consulta.where, filtro);
  assert.equal(resultado.total, 21);
  assert.equal(resultado.totalPages, 3);
  assert.equal(resultado.page, 2);
});
await test('Consulta administrativa expone el folio del responsable para miembros de grupo', async () => {
  let includeUsuarios;
  const servicio = new PrismaAdminQueryService({
    usuarios: {
      count: async () => 1,
      findMany: async argumentos => {
        includeUsuarios = argumentos.include;
        return [{
          folio_registro: 'ANI26-0008',
          nombre: 'Luis',
          apellido: 'Pérez',
          correo: 'luis@example.com',
          telefono: null,
          fecha_registro: new Date('2026-10-01'),
          instituciones: null,
          titulos: null,
          depositos: [],
          grupo_registro: { folio_registro_responsable: 'ANI26-0007' },
        }];
      },
    },
  });
  const resultado = await servicio.obtenerUsuariosForAdmin(1, 10);
  assert.deepEqual(includeUsuarios.grupo_registro, { select: { folio_registro_responsable: true } });
  assert.equal(resultado.data[0].registradoPor, 'ANI26-0007');
  assert.equal(resultado.data[0].deposito, null);
});
await test('Detalle de usuario consulta los grupos que registró como responsable', async () => {
  let consulta;
  const servicio = new PrismaRegistroQueryService({
    grupos_registro: {
      findMany: async argumentos => { consulta = argumentos; return []; },
    },
  });
  const grupos = await servicio.obtenerGruposRegistrados('ANI26-0007');
  assert.deepEqual(consulta.where, { folio_registro_responsable: 'ANI26-0007' });
  assert.deepEqual(consulta.orderBy, [{ fecha_registro: 'desc' }, { id: 'desc' }]);
  assert.deepEqual(grupos, []);
});
await test('Detalle de usuario expone al responsable del grupo que lo registró', async () => {
  let include;
  const servicio = new PrismaRegistroQueryService({
    usuarios: {
      findUnique: async argumentos => {
        include = argumentos.include;
        return {
          folio_registro: 'ANI26-0008',
          nombre: 'Luis',
          apellido: 'Pérez',
          correo: 'luis@example.com',
          telefono: null,
          lada: null,
          extension: null,
          genero: null,
          carrera: null,
          dependencia: null,
          id_titulo: null,
          id_tipo_participante: 1,
          id_institucion: 1,
          id_entidad_federativa: 1,
          institucion_externa: null,
          fecha_registro: new Date('2026-10-01'),
          instituciones: null,
          titulos: null,
          estados: null,
          grupo_registro: {
            responsable: { folio_registro: 'ANI26-0007', nombre: 'Ana', apellido: 'López', correo: 'ana@example.com' },
          },
        };
      },
    },
    depositos: { findMany: async () => [] },
    facturaciones: { findFirst: async () => null },
    inscripcion_actividades: { findMany: async () => [] },
  });
  const detalle = await servicio.obtenerDetalle('ANI26-0008');
  assert.deepEqual(include.grupo_registro, {
    include: { responsable: { select: { folio_registro: true, nombre: true, apellido: true, correo: true } } },
  });
  assert.deepEqual(detalle.registradoPor, {
    folioRegistro: 'ANI26-0007',
    nombreCompleto: 'Ana López',
    correo: 'ana@example.com',
  });
});
await test('Detalle sin grupo no expone responsable de registro', async () => {
  const servicio = new PrismaRegistroQueryService({
    usuarios: {
      findUnique: async () => ({
        folio_registro: 'ANI26-0009',
        nombre: 'Marta',
        apellido: 'Ruiz',
        correo: 'marta@example.com',
        telefono: null,
        lada: null,
        extension: null,
        genero: null,
        carrera: null,
        dependencia: null,
        id_titulo: null,
        id_tipo_participante: 1,
        id_institucion: 1,
        id_entidad_federativa: 1,
        institucion_externa: null,
        fecha_registro: new Date('2026-10-01'),
        instituciones: null,
        titulos: null,
        estados: null,
        grupo_registro: null,
      }),
    },
    depositos: { findMany: async () => [] },
    facturaciones: { findFirst: async () => null },
    inscripcion_actividades: { findMany: async () => [] },
  });
  const detalle = await servicio.obtenerDetalle('ANI26-0009');
  assert.equal(detalle.registradoPor, null);
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
await test('Filesystem firma, descarga y bloquea traversal y firmas alteradas (enlaces sin expiración)', async () => {
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
    assert.equal(enlaces.validar('comprobantes/prueba.pdf', '1', sig), 'INVALIDO');
    const expAntigua = '1';
    const sigAntigua = createHmac('sha256', secret).update(`comprobantes/prueba.pdf:${expAntigua}`).digest('hex');
    assert.equal(enlaces.validar('comprobantes/prueba.pdf', expAntigua, sigAntigua), 'VALIDO');
    assert.deepEqual(new Uint8Array(await disk.descargar('comprobantes/prueba.pdf')), archivo.buffer);
    await assert.rejects(disk.descargar('../prueba.pdf'), /traversal/);
    const auth = { getCurrentSession: async () => ({ folioRegistro: 'ANI26-0001' }) };
    const accesos = { buscarPorFolioRegistro: async () => ({ folioRegistro: 'ANI26-0001', isAdmin: () => true }) };
    const descargar = new DescargarArchivo(disk, auth, accesos, { buscarTodosPorUsuario: async () => [] }, enlaces);
    await assert.rejects(descargar.execute('comprobantes/prueba.pdf', '1', sig), /No autorizado/);
    assert.deepEqual(new Uint8Array(await descargar.execute('comprobantes/prueba.pdf', expAntigua, sigAntigua)), archivo.buffer);
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

// ── Exportación de base de datos ────────────────────────────────────────────
const { ExportarBaseDatos } = load('@/application/use-cases/ExportarBaseDatos');
const { ExportacionBaseDatosError } = load('@/core/errors/ExportacionBaseDatosError');
const {
  MysqlDumpExportacionBaseDatosService,
  parsearConexionMysql,
  escaparValorArchivoOpciones,
  contenidoArchivoOpciones,
  construirArgumentosMysqldump,
  nombreRespaldoUtc,
} = load('@/infrastructure/services/database/MysqlDumpExportacionBaseDatosService');

const guardia = { requireAdmin: async () => ({ folioRegistro: 'ANI26-ADM' }) };
const reportes = [];
let servicioExportacion = null;
cache.set(path.join(root, 'shared/auth/requireAdmin.ts'), { exports: guardia });
cache.set(path.join(root, 'infrastructure/config/container.ts'), {
  exports: {
    getExportacionBaseDatosService: () => servicioExportacion,
    reportarErrorEnAccion: (contexto, error) => reportes.push({ contexto, error }),
  },
});
const { POST } = load('@/app/api/admin/base-datos/exportar/route');

const dirExport = fs.mkdtempSync(path.join(os.tmpdir(), 'aniei-export-test-'));
const CONEXION_EXPORT = { host: '127.0.0.1', port: 3306, usuario: 'usuario-prueba', password: 'p@ss"w%#x', base: 'aniei' };
function scriptEjecutable(nombre, cuerpo) {
  const ruta = path.join(dirExport, nombre);
  fs.writeFileSync(ruta, `#!/bin/sh\n${cuerpo}\n`, { mode: 0o755 });
  return ruta;
}
function servicioCon(binario, extra = {}) {
  return new MysqlDumpExportacionBaseDatosService(CONEXION_EXPORT, { binario, timeoutMs: 5000, maxBytes: 10000000, directorioTemporal: dirExport, ...extra });
}
function temporalesExportActivos() {
  return fs.readdirSync(dirExport).filter((nombre) => nombre.startsWith('aniei-bd-export-'));
}
function cancelacionDoble() {
  const callbacks = [];
  let cancelada = false;
  return {
    control: { estaCancelada: () => cancelada, alCancelar: (callback) => { if (cancelada) callback(); else callbacks.push(callback); } },
    cancelar: () => { cancelada = true; for (const callback of callbacks) callback(); },
  };
}
function solicitudExportar({ origin = 'http://localhost:3000', conOrigen = true } = {}) {
  const headers = new Headers();
  if (conOrigen) headers.set('origin', origin);
  return {
    method: 'POST',
    headers,
    signal: new AbortController().signal,
    nextUrl: new URL('http://localhost:3000/api/admin/base-datos/exportar'),
  };
}

await test('El caso de uso delega en un doble del puerto sin importar infraestructura', async () => {
  const cancelacion = cancelacionDoble();
  let liberada = 0;
  const doble = {
    exportar: async (recibida) => {
      assert.equal(recibida, cancelacion.control);
      return {
        nombreArchivo: 'prueba.sql.gz',
        tipoContenido: 'application/gzip',
        tamanoBytes: 3,
        contenido: (async function* () { yield* [new Uint8Array([1, 2]), new Uint8Array([3])]; })(),
        liberar: async () => { liberada++; },
      };
    },
  };
  const dto = await new ExportarBaseDatos(doble).ejecutar(cancelacion.control);
  const leidos = [];
  for await (const bloque of dto.contenido) leidos.push(...bloque);
  assert.deepEqual(leidos, [1, 2, 3]);
  await dto.liberar();
  assert.equal(liberada, 1);
  assert.equal(nombreRespaldoUtc(new Date(Date.UTC(2026, 9, 22, 15, 4, 9))), 'aniei-bd-2026-10-22_15-04-09-UTC.sql.gz');
});

await test('La conexión se decodifica y las credenciales se escapan para el archivo de opciones', () => {
  const conexion = parsearConexionMysql('mysql://usuario%40dominio:c%23l%22ave@db.example:3307/aniei$0');
  assert.deepEqual(conexion, { host: 'db.example', port: 3307, usuario: 'usuario@dominio', password: 'c#l"ave', base: 'aniei$0' });
  assert.throws(() => parsearConexionMysql('postgres://u:p@h/db'));
  assert.throws(() => parsearConexionMysql('mysql://u:p@h/'));
  assert.throws(() => parsearConexionMysql('mysql://u:p@h/base con espacio'));
  assert.equal(escaparValorArchivoOpciones('p@ss"w%'), 'p@ss\\"w\\%');
  const archivo = contenidoArchivoOpciones({ host: 'localhost', port: 3306, usuario: 'u', password: 'p@ss"w%', base: 'b' });
  assert.ok(archivo.includes('password="p@ss\\"w\\%"'));
  assert.ok(archivo.startsWith('[client]'));
  const argumentos = construirArgumentosMysqldump('/tmp/x/my.cnf', 'aniei');
  assert.equal(argumentos[0], '--defaults-file=/tmp/x/my.cnf');
  for (const opcion of ['--single-transaction', '--quick', '--hex-blob', '--tz-utc', '--routines', '--events', '--triggers', '--no-tablespaces', '--set-gtid-purged=OFF', '--databases']) {
    assert.ok(argumentos.includes(opcion), opcion);
  }
  assert.ok(!argumentos.some((argumento) => String(argumento).includes('p@ss')));
});

await test('Sin conexión configurada la exportación falla antes de tocar el sistema de archivos', async () => {
  const servicio = new MysqlDumpExportacionBaseDatosService(null, { binario: 'mysqldump', timeoutMs: 1000, maxBytes: 10 });
  await assert.rejects(servicio.exportar(cancelacionDoble().control), /no está configurada/);
});

await test('El adaptador genera un gzip legible, oculta credenciales y libera concurrencia al terminar', async () => {
  const eco = scriptEjecutable('eco.sh', 'printf "ARGUMENTOS %s\\n" "$@"\necho ARCHIVO\ncat "${1#--defaults-file=}"');
  const servicio = servicioCon(eco);
  const dto = await servicio.exportar(cancelacionDoble().control);
  assert.match(dto.nombreArchivo, /^aniei-bd-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}-UTC\.sql\.gz$/);
  assert.equal(dto.tipoContenido, 'application/gzip');
  const trozos = [];
  for await (const bloque of dto.contenido) trozos.push(bloque);
  const total = Buffer.concat(trozos.map((trozo) => Buffer.from(trozo)));
  assert.equal(total.length, dto.tamanoBytes);
  assert.equal(total[0], 0x1f);
  assert.equal(total[1], 0x8b);
  const texto = gunzipSync(total).toString('utf8');
  const [seccionArgumentos, seccionArchivo] = texto.split('ARCHIVO\n');
  assert.ok(seccionArgumentos.includes('ARGUMENTOS --single-transaction'));
  assert.ok(seccionArgumentos.includes('ARGUMENTOS --databases'));
  assert.ok(seccionArgumentos.includes('ARGUMENTOS aniei'));
  assert.ok(!seccionArgumentos.includes('p@ss'), 'las credenciales no viajan en argumentos');
  assert.ok(seccionArchivo.includes('password="p@ss\\"w\\%#x"'), 'el archivo de opciones lleva la contraseña escapada');
  assert.deepEqual(temporalesExportActivos(), []);
  const dto2 = await servicio.exportar(cancelacionDoble().control);
  await dto2.liberar();
  assert.deepEqual(temporalesExportActivos(), []);
});

await test('Dos solicitudes simultáneas respetan la concurrencia y la cancelación libera el límite', async () => {
  const lento = scriptEjecutable('lento.sh', 'exec sleep 30');
  const servicio = servicioCon(lento, { timeoutMs: 60000 });
  const primera = cancelacionDoble();
  const activa = servicio.exportar(primera.control);
  await assert.rejects(servicio.exportar(cancelacionDoble().control), /exportación de la base de datos en curso/);
  primera.cancelar();
  await assert.rejects(activa, /cancelada/);
  assert.deepEqual(temporalesExportActivos(), []);
  await assert.rejects(servicioCon(path.join(dirExport, 'no-existe')).exportar(cancelacionDoble().control), /mysqldump no está disponible/);
});

await test('El timeout termina el proceso sin dejar temporales ni concurrencia', async () => {
  const lento = scriptEjecutable('lento2.sh', 'exec sleep 30');
  const servicio = servicioCon(lento, { timeoutMs: 150 });
  await assert.rejects(servicio.exportar(cancelacionDoble().control), /tiempo máximo/);
  assert.deepEqual(temporalesExportActivos(), []);
});

await test('El límite de tamaño aborta la generación y limpia el temporal', async () => {
  const grande = scriptEjecutable('grande.sh', 'dd if=/dev/urandom bs=65536 count=64 2>/dev/null');
  const servicio = servicioCon(grande, { maxBytes: 20000 });
  await assert.rejects(servicio.exportar(cancelacionDoble().control), /tamaño máximo/);
  assert.deepEqual(temporalesExportActivos(), []);
});

await test('El fallo del binario se traduce a error tipado sin filtrar la contraseña', async () => {
  const falla = scriptEjecutable('falla.sh', 'echo "mysqldump: Got error: 1045: Access denied for user (using password: YES)" >&2\nexit 2');
  await assert.rejects(servicioCon(falla).exportar(cancelacionDoble().control), (error) => {
    assert.ok(error instanceof ExportacionBaseDatosError);
    assert.equal(error.motivo, 'FALLO');
    assert.match(error.message, /No se pudo generar/);
    assert.ok(error.detalle.includes('Access denied'));
    assert.ok(!error.detalle.includes('p@ss'), 'el detalle interno oculta la contraseña');
    return true;
  });
  assert.deepEqual(temporalesExportActivos(), []);
});

await test('mysqldump real lee credenciales con caracteres especiales desde el archivo de opciones', async () => {
  const sonda = spawnSync('/usr/bin/mysqldump', ['--no-defaults', '--protocol=TCP', '--host=127.0.0.1', '--port=3306', '--user=sonda', '--password=sonda', '--databases', 'sonda'], { timeout: 8000 });
  const salidaSonda = `${sonda.stderr?.toString() ?? ''}${sonda.stdout?.toString() ?? ''}`;
  if (!/access denied/i.test(salidaSonda)) return;
  const servicio = new MysqlDumpExportacionBaseDatosService(
    { host: '127.0.0.1', port: 3306, usuario: 'sonda\'"user', password: 'p@ss"w%#x\\', base: 'aniei' },
    { binario: '/usr/bin/mysqldump', timeoutMs: 15000, maxBytes: 10000000, directorioTemporal: dirExport },
  );
  await assert.rejects(servicio.exportar(cancelacionDoble().control), (error) => {
    assert.ok(error instanceof ExportacionBaseDatosError);
    assert.equal(error.motivo, 'FALLO');
    assert.match(error.detalle ?? '', /access denied/i);
    assert.ok(!(error.detalle ?? '').includes('p@ss"w%#x'), 'la contraseña real no aparece en el detalle');
    return true;
  });
  assert.deepEqual(temporalesExportActivos(), []);
});

await test('Solicitantes no autorizados o de origen ajeno no alcanzan el servicio de exportación', async () => {
  reportes.length = 0;
  let llamadas = 0;
  servicioExportacion = { exportar: async () => { llamadas++; throw new ExportacionBaseDatosError('FALLO'); } };
  guardia.requireAdmin = async () => { throw new Error('UNAUTHORIZED'); };
  let respuesta = await POST(solicitudExportar());
  assert.equal(respuesta.status, 401);
  guardia.requireAdmin = async () => { throw new Error('FORBIDDEN'); };
  respuesta = await POST(solicitudExportar());
  assert.equal(respuesta.status, 403);
  guardia.requireAdmin = async () => ({ folioRegistro: 'ANI26-ADM' });
  respuesta = await POST(solicitudExportar({ origin: 'https://evil.example' }));
  assert.equal(respuesta.status, 403);
  respuesta = await POST(solicitudExportar({ conOrigen: false }));
  assert.equal(respuesta.status, 403);
  assert.equal(llamadas, 0);
  assert.deepEqual(reportes, []);
  servicioExportacion = null;
});

await test('Los errores de exportación se traducen a códigos HTTP en español', async () => {
  guardia.requireAdmin = async () => ({});
  const casos = [
    ['CONCURRENCIA', 409],
    ['SIN_CONFIGURAR', 503],
    ['BINARIO_NO_DISPONIBLE', 503],
    ['TIMEOUT', 504],
    ['TAMANO_EXCEDIDO', 413],
    ['FALLO', 500],
  ];
  for (const [motivo, esperado] of casos) {
    reportes.length = 0;
    servicioExportacion = { exportar: async () => { throw new ExportacionBaseDatosError(motivo); } };
    const respuesta = await POST(solicitudExportar());
    assert.equal(respuesta.status, esperado, motivo);
    const cuerpo = await respuesta.json();
    assert.ok(cuerpo.error.length > 0, motivo);
    if (motivo === 'CONCURRENCIA') assert.deepEqual(reportes, [], motivo);
    else assert.equal(reportes.length, 1, motivo);
  }
  servicioExportacion = null;
});

await test('La respuesta exitosa entrega el gzip con cabeceras de adjunto y sin filtrar datos internos', async () => {
  const bloques = [new Uint8Array([0x1f, 0x8b, 1]), new Uint8Array([2, 3])];
  servicioExportacion = {
    exportar: async () => ({
      nombreArchivo: 'aniei-bd-2026-10-22_15-04-09-UTC.sql.gz',
      tipoContenido: 'application/gzip',
      tamanoBytes: 5,
      contenido: (async function* () { for (const bloque of bloques) yield bloque; })(),
      liberar: async () => {},
    }),
  };
  const respuesta = await POST(solicitudExportar());
  assert.equal(respuesta.status, 200);
  assert.equal(respuesta.headers.get('content-type'), 'application/gzip');
  const disposicion = respuesta.headers.get('content-disposition');
  assert.ok(disposicion?.startsWith('attachment'));
  assert.ok(disposicion?.includes('aniei-bd-2026-10-22_15-04-09-UTC.sql.gz'));
  assert.equal(respuesta.headers.get('content-length'), '5');
  assert.equal(respuesta.headers.get('cache-control'), 'private, no-store');
  assert.equal(respuesta.headers.get('x-content-type-options'), 'nosniff');
  const cuerpo = new Uint8Array(await respuesta.arrayBuffer());
  assert.deepEqual([...cuerpo], [0x1f, 0x8b, 1, 2, 3]);
  servicioExportacion = null;
});

await test('Un fallo durante la transmisión cierra el flujo, libera recursos y registra el error', async () => {
  reportes.length = 0;
  let liberada = 0;
  servicioExportacion = {
    exportar: async () => ({
      nombreArchivo: 'x.sql.gz',
      tipoContenido: 'application/gzip',
      tamanoBytes: 9,
      contenido: (async function* () { yield new Uint8Array([1]); throw new ExportacionBaseDatosError('TIMEOUT'); })(),
      liberar: async () => { liberada++; },
    }),
  };
  const respuesta = await POST(solicitudExportar());
  assert.equal(respuesta.status, 200);
  await assert.rejects(respuesta.arrayBuffer());
  assert.equal(liberada, 1);
  assert.equal(reportes.length, 1);
  assert.match(reportes[0].contexto, /transmitir/);
  servicioExportacion = null;
});

await test('El perfil identifica miembros de grupo sin exigirles pago', async () => {
  const usuarioBase = {
    folioRegistro: 'ANI26-0002', nombre: 'Luis', apellido: 'Pérez', correo: 'luis@example.com',
    telefono: null, lada: null, extension: null, genero: 'F', carrera: null, dependencia: 'Facultad',
    idTitulo: 1, idTipoParticipante: 1, idInstitucion: 1, idEntidadFederativa: 1,
    institucionExterna: null, idGrupoRegistro: 7, fechaRegistro: new Date('2026-10-01'),
  };
  const registros = {
    obtenerPerfil: async () => ({
      usuario: usuarioBase, depositos: [], facturacion: null, inscripciones: [], equipos: [], registradoPor: null,
    }),
  };
  const precios = { obtenerVigente: async () => { throw new Error('No debe consultar precio de miembro de grupo'); } };
  const resultado = await new ObtenerPerfilRegistro(registros, precios).execute('ANI26-0002');
  assert.equal(resultado.estado.esMiembroGrupo, true);
  assert.equal(resultado.estado.pagoCubiertoPorGrupo, true);
  assert.equal(resultado.estado.requierePago, false);
  assert.equal(resultado.estado.precioVigente, null);
});

await test('El perfil exige completar datos y después calcula el pago vigente', async () => {
  const incompleto = {
    folioRegistro: 'ANI26-0010', nombre: 'Aldo', apellido: 'Delgadillo', correo: 'aldo@example.com',
    telefono: null, lada: null, extension: null, genero: null, carrera: null, dependencia: null,
    idTitulo: null, idTipoParticipante: null, idInstitucion: null, idEntidadFederativa: null,
    institucionExterna: null, idGrupoRegistro: null, fechaRegistro: new Date('2026-10-01'),
  };
  const precio = { id: 1, idTipoParticipante: 1, esAfiliada: true, fechaLimite: new Date('2026-01-01'), costo: 451, orden: 1, activo: true };
  const registros = {
    obtenerPerfil: async () => ({
      usuario: incompleto, depositos: [], facturacion: null, inscripciones: [], equipos: [], registradoPor: null,
    }),
  };
  const precios = { obtenerVigente: async () => precio };
  const sinDatos = await new ObtenerPerfilRegistro(registros, precios).execute('ANI26-0010');
  assert.equal(sinDatos.estado.datosCompletados, false);
  assert.equal(sinDatos.estado.requierePago, true);
  assert.equal(sinDatos.estado.precioVigente, null);
  assert.equal(sinDatos.estado.camposFaltantes.idTitulo, true);
  assert.equal(sinDatos.estado.camposFaltantes.institucion, true);

  registros.obtenerPerfil = async () => ({
    usuario: { ...incompleto, genero: 'M', idTitulo: 1, idTipoParticipante: 1, idInstitucion: 1, idEntidadFederativa: 1 },
    depositos: [], facturacion: null, inscripciones: [], equipos: [], registradoPor: null,
  });
  const conDatos = await new ObtenerPerfilRegistro(registros, precios).execute('ANI26-0010');
  assert.equal(conDatos.estado.datosCompletados, true);
  assert.equal(conDatos.estado.requierePago, true);
  assert.equal(conDatos.estado.precioVigente.costo, 451);
});

await test('Completar datos solo llena campos vacíos y bloquea segundas modificaciones', async () => {
  const actual = {
    folioRegistro: 'ANI26-0002', nombre: 'Luis', apellido: 'Pérez', correo: 'luis@example.com',
    telefono: null, lada: null, extension: null, genero: null, carrera: null, dependencia: 'Facultad',
    idTitulo: null, idTipoParticipante: 1, idInstitucion: 3, idEntidadFederativa: 1,
    institucionExterna: null, idGrupoRegistro: 7, fechaRegistro: new Date('2026-10-01'),
  };
  let guardado;
  const registros = { obtenerUsuario: async () => actual };
  const usuarios = { actualizar: async (folio, data) => { guardado = { folio, data }; } };
  await new CompletarDatosRegistro(registros, usuarios).execute('ANI26-0002', {
    genero: 'F', idTitulo: 2, carrera: 'Sistemas', telefono: '9971105996', noAfiliada: false, idInstitucion: 99,
  });
  assert.equal(guardado.folio, 'ANI26-0002');
  assert.equal(guardado.data.genero, 'F');
  assert.equal(guardado.data.idTitulo, 2);
  assert.equal(guardado.data.carrera, 'Sistemas');
  assert.equal(guardado.data.telefono, '9971105996');
  assert.equal(guardado.data.idInstitucion, 3, 'no debe sobrescribir la institución existente');
  assert.equal(guardado.data.dependencia, 'Facultad', 'no debe sobrescribir la dependencia existente');
  assert.equal(guardado.data.idTipoParticipante, 1, 'no debe sobrescribir el tipo de participante existente');

  await assert.rejects(
    new CompletarDatosRegistro({ obtenerUsuario: async () => ({ ...actual, genero: 'F', idTitulo: 2 }) },
      { actualizar: async () => assert.fail('No debe actualizar datos completos') })
      .execute('ANI26-0002', { noAfiliada: false }),
    /no pueden modificarse/,
  );
});

await test('El pago de perfil rechaza miembros de grupo y compensa el comprobante si falla la transacción', async () => {
  const base = {
    folioRegistro: 'ANI26-0001', nombre: 'Ana', apellido: 'Pérez', correo: 'ana@example.com',
    telefono: '9971105996', lada: null, extension: null, genero: 'F', carrera: null, dependencia: null,
    idTitulo: 1, idTipoParticipante: 1, idInstitucion: 1, idEntidadFederativa: 1,
    institucionExterna: null, idGrupoRegistro: null, fechaRegistro: new Date('2026-10-01'),
  };
  const precio = { id: 1, idTipoParticipante: 1, esAfiliada: true, fechaLimite: new Date('2026-01-01'), costo: 451, orden: 1, activo: true };
  const archivoPago = { nombre: 'pago.pdf', mime: 'application/pdf', tamanio: 3, buffer: new Uint8Array([1, 2, 3]) };
  const pago = { referencia: 'ref-1', fechaDeposito: new Date('2026-10-01'), archivo: archivoPago };

  const grupo = new RegistrarPagoRegistro(
    { obtenerUsuario: async () => ({ ...base, idGrupoRegistro: 7 }) },
    { buscarTodosPorUsuario: async () => [] },
    { obtenerVigente: async () => precio },
    storage(), { run: async () => assert.fail('No debe iniciar transacción') }, ids,
  );
  await assert.rejects(grupo.execute('ANI26-0002', pago), /cubierto por el registro grupal/);

  const disco = storage();
  const useCase = new RegistrarPagoRegistro(
    { obtenerUsuario: async () => base },
    { buscarTodosPorUsuario: async () => [] },
    { obtenerVigente: async () => precio },
    disco,
    { run: async () => { throw new Error('rollback'); } },
    ids,
  );
  await assert.rejects(useCase.execute('ANI26-0001', pago), /rollback/);
  assert.equal(disco.files.size, 0);
  assert.deepEqual(disco.eliminados, ['comprobantes/id-prueba.pdf']);
});

await test('El pago de perfil usa el precio vigente y no el monto enviado por el cliente', async () => {
  const base = {
    folioRegistro: 'ANI26-0001', nombre: 'Ana', apellido: 'Pérez', correo: 'ana@example.com',
    telefono: '9971105996', lada: null, extension: null, genero: 'F', carrera: null, dependencia: null,
    idTitulo: 1, idTipoParticipante: 1, idInstitucion: null, idEntidadFederativa: 1,
    institucionExterna: 'Universidad Externa', idGrupoRegistro: null, fechaRegistro: new Date('2026-10-01'),
  };
  let creado;
  const precio = { id: 3, idTipoParticipante: 1, esAfiliada: false, fechaLimite: new Date('2026-01-01'), costo: 500, orden: 1, activo: true };
  let solicitado;
  const useCase = new RegistrarPagoRegistro(
    { obtenerUsuario: async () => base },
    { buscarTodosPorUsuario: async () => [] },
    { obtenerVigente: async (tipo, afiliada) => { solicitado = { tipo, afiliada }; return precio; } },
    storage(),
    { run: async fn => fn({ depositoRepo: { buscarTodosPorUsuario: async () => [], crear: async d => { creado = d; } } }) },
    ids,
  );
  const resultado = await useCase.execute('ANI26-0001', {
    referencia: 'ref-2', fechaDeposito: new Date('2026-10-01'),
    archivo: { nombre: 'pago.pdf', mime: 'application/pdf', tamanio: 3, buffer: new Uint8Array([1]) },
  });
  assert.deepEqual(solicitado, { tipo: 1, afiliada: false });
  assert.equal(resultado.monto, 500);
  assert.equal(creado.monto.toNumber(), 500);
  assert.equal(creado.proposito, 'EVENTO_PRINCIPAL');
});

await test('El ZIP de constancias incluye solo talleres y agrupa por actividad', async () => {
  const talleres = [
    {
      idActividad: 1,
      nombre: 'Taller de Bases de Datos',
      activo: true,
      tipoActividad: { clave: 'TALLER', descripcion: 'Taller' },
      ponentes: [
        { folioRegistro: 'ANI26-0001', nombre: 'Ana', apellido: 'Pérez' },
        { folioRegistro: 'ANI26-0002', nombre: 'Luis', apellido: 'Gómez' },
      ],
    },
    {
      idActividad: 2,
      nombre: 'Ponencia de Redes',
      activo: true,
      tipoActividad: { clave: 'PONENCIA', descripcion: 'Ponencia' },
      ponentes: [{ folioRegistro: 'ANI26-0003', nombre: 'Marta', apellido: 'Ruiz' }],
    },
    {
      idActividad: 3,
      nombre: 'Taller sin talleristas',
      activo: true,
      tipoActividad: { clave: 'TALLER', descripcion: 'Taller' },
      ponentes: [],
    },
    {
      idActividad: 4,
      nombre: 'Taller de Redes',
      activo: true,
      tipoActividad: { clave: 'TALLER', descripcion: 'Taller' },
      ponentes: [{ folioRegistro: 'ANI26-0004', nombre: 'José', apellido: 'Núñez' }],
    },
    {
      idActividad: 5,
      nombre: 'Taller cancelado',
      activo: false,
      tipoActividad: { clave: 'TALLER', descripcion: 'Taller' },
      ponentes: [{ folioRegistro: 'ANI26-0005', nombre: 'Elena', apellido: 'Soto' }],
    },
  ];
  const constancias = [];
  let archivos = [];
  const resultado = await new DescargarConstanciasTalleristas(
    { listar: async () => talleres },
    {
      generarConstancia: async (contenido) => {
        constancias.push(contenido);
        return new Uint8Array([constancias.length]);
      },
    },
    {
      comprimir: async (entradas) => {
        archivos = entradas;
        return new Uint8Array([9]);
      },
    },
  ).ejecutar();

  assert.equal(resultado.totalTalleres, 2);
  assert.equal(resultado.totalConstancias, 3);
  assert.equal(constancias.length, 3);
  assert.equal(constancias[0].cuerpo[0].segmentos[0].texto, 'por haber impartido el Taller');
  assert.equal(constancias[0].cuerpo[1].segmentos[0].texto, 'Taller de Bases de Datos');
  assert.deepEqual(
    archivos.map((archivo) => archivo.nombre),
    [
      '01_Taller_de_Bases_de_Datos/Ana_Perez_ANI26_0001.pdf',
      '01_Taller_de_Bases_de_Datos/Luis_Gomez_ANI26_0002.pdf',
      '02_Taller_de_Redes/Jose_Nunez_ANI26_0004.pdf',
    ],
  );
});

await test('El ZIP de constancias no se genera si no hay talleres con talleristas', async () => {
  const resultado = await new DescargarConstanciasTalleristas(
    {
      listar: async () => [{
        idActividad: 1,
        nombre: 'Taller vacío',
        activo: true,
        tipoActividad: { clave: 'TALLER', descripcion: 'Taller' },
        ponentes: [],
      }],
    },
    { generarConstancia: async () => assert.fail('No debe generar constancias') },
    { comprimir: async () => assert.fail('No debe comprimir') },
  ).ejecutar();

  assert.equal(resultado, null);
});

fs.rmSync(dirExport, { recursive: true, force: true });
