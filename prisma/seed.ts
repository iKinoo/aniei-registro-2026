import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';

const globalForPrisma = globalThis as any;

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL no está configurada');

  const u = new URL(url);
  const adapter = new PrismaMariaDb({
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ''),
    connectionLimit: 10,
    acquireTimeout: 5000,
    idleTimeout: 30,
    connectTimeout: 5000,
    timezone: 'Z',
  });

  return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;

async function main() {
  console.log('Iniciando seed de catálogos...');

  // 1. cargos
  const cargos = [
    { id_cargo: 1, descripcion: 'Alumno' },
    { id_cargo: 2, descripcion: 'Profesor' },
    { id_cargo: 3, descripcion: 'Secretario/Subdirector' },
    { id_cargo: 4, descripcion: 'Jefe de Departamento' },
    { id_cargo: 5, descripcion: 'Director' },
    { id_cargo: 6, descripcion: 'Otro' },
  ];
  for (const c of cargos) {
    await prisma.cargos.upsert({
      where: { id_cargo: c.id_cargo },
      update: {},
      create: c,
    });
  }
  console.log(`cargos: ${cargos.length} registros`);

  // 2. estados
  const estados = [
    { id_entidad_federativa: 1, nombre: 'Aguascalientes' },
    { id_entidad_federativa: 2, nombre: 'Baja California' },
    { id_entidad_federativa: 3, nombre: 'Baja California Sur' },
    { id_entidad_federativa: 4, nombre: 'Campeche' },
    { id_entidad_federativa: 5, nombre: 'Chiapas' },
    { id_entidad_federativa: 6, nombre: 'Chihuahua' },
    { id_entidad_federativa: 7, nombre: 'Coahuila' },
    { id_entidad_federativa: 8, nombre: 'Colima' },
    { id_entidad_federativa: 9, nombre: 'Ciudad de México' },
    { id_entidad_federativa: 10, nombre: 'Durango' },
    { id_entidad_federativa: 11, nombre: 'Estado de México' },
    { id_entidad_federativa: 12, nombre: 'Guanajuato' },
    { id_entidad_federativa: 13, nombre: 'Guerrero' },
    { id_entidad_federativa: 14, nombre: 'Hidalgo' },
    { id_entidad_federativa: 15, nombre: 'Jalisco' },
    { id_entidad_federativa: 16, nombre: 'Michoacán' },
    { id_entidad_federativa: 17, nombre: 'Morelos' },
    { id_entidad_federativa: 18, nombre: 'Nayarit' },
    { id_entidad_federativa: 19, nombre: 'Nuevo León' },
    { id_entidad_federativa: 20, nombre: 'Oaxaca' },
    { id_entidad_federativa: 21, nombre: 'Puebla' },
    { id_entidad_federativa: 22, nombre: 'Querétaro' },
    { id_entidad_federativa: 23, nombre: 'Quintana Roo' },
    { id_entidad_federativa: 24, nombre: 'San Luis Potosí' },
    { id_entidad_federativa: 25, nombre: 'Sinaloa' },
    { id_entidad_federativa: 26, nombre: 'Sonora' },
    { id_entidad_federativa: 27, nombre: 'Tabasco' },
    { id_entidad_federativa: 28, nombre: 'Tamaulipas' },
    { id_entidad_federativa: 29, nombre: 'Tlaxcala' },
    { id_entidad_federativa: 30, nombre: 'Veracruz' },
    { id_entidad_federativa: 31, nombre: 'Yucatán' },
    { id_entidad_federativa: 32, nombre: 'Zacatecas' },
  ];
  for (const e of estados) {
    await prisma.estados.upsert({
      where: { id_entidad_federativa: e.id_entidad_federativa },
      update: {},
      create: e,
    });
  }
  console.log(`estados: ${estados.length} registros`);

  // 3. tipo_usuario
  const tipoUsuarios = [
    { id_tipo_usuario: 1, descripcion: 'Alumno' },
    { id_tipo_usuario: 2, descripcion: 'Académico' },
    { id_tipo_usuario: 3, descripcion: 'Directivo' },
    { id_tipo_usuario: 4, descripcion: 'Instructor' },
    { id_tipo_usuario: 5, descripcion: 'Ponente' },
    { id_tipo_usuario: 6, descripcion: 'Externo' },
  ];
  for (const t of tipoUsuarios) {
    await prisma.tipo_usuario.upsert({
      where: { id_tipo_usuario: t.id_tipo_usuario },
      update: {},
      create: t,
    });
  }
  console.log(`tipo_usuario: ${tipoUsuarios.length} registros`);

  // 4. tipo_actividad
  const tipoActividades = [
    { id_tipo_actividad: 1, descripcion: 'Taller', clave: 'TALLER', maneja_equipos: false, genera_constancia_participante: true },
    { id_tipo_actividad: 2, descripcion: 'Seminario', clave: 'SEMINARIO', maneja_equipos: false, genera_constancia_participante: true },
    { id_tipo_actividad: 3, descripcion: 'Conferencia Magistral', clave: 'CONF_MAGISTRAL', maneja_equipos: false, genera_constancia_participante: true },
    { id_tipo_actividad: 4, descripcion: 'Conferencia Simultánea', clave: 'CONF_SIMULTANEA', maneja_equipos: false, genera_constancia_participante: true },
    { id_tipo_actividad: 5, descripcion: 'Videoconferencia', clave: 'VIDEOCONF', maneja_equipos: false, genera_constancia_participante: true },
    { id_tipo_actividad: 6, descripcion: 'Mesa de Trabajo', clave: 'MESA_TRABAJO', maneja_equipos: false, genera_constancia_participante: true },
    { id_tipo_actividad: 7, descripcion: 'Concurso', clave: 'CONCURSO', maneja_equipos: true, genera_constancia_participante: true },
    { id_tipo_actividad: 8, descripcion: 'Ponencia', clave: 'PONENCIA', maneja_equipos: false, genera_constancia_participante: true },
    { id_tipo_actividad: 9, descripcion: 'Tesis', clave: 'TESIS', maneja_equipos: false, genera_constancia_participante: false },
    { id_tipo_actividad: 10, descripcion: 'Conferencia Invitada', clave: 'CONF_INVITADA', maneja_equipos: false, genera_constancia_participante: true },
    { id_tipo_actividad: 11, descripcion: 'Hackatón', clave: 'HACKATON', maneja_equipos: true, genera_constancia_participante: true },
    { id_tipo_actividad: 12, descripcion: 'Certificación', clave: 'CERTIFICACION', maneja_equipos: false, genera_constancia_participante: true },
    { id_tipo_actividad: 13, descripcion: 'Inauguración', clave: 'INAUGURACION', maneja_equipos: false, genera_constancia_participante: false },
  ];
  for (const t of tipoActividades) {
    await prisma.tipo_actividad.upsert({
      where: { id_tipo_actividad: t.id_tipo_actividad },
      update: {},
      create: t,
    });
  }
  console.log(`tipo_actividad: ${tipoActividades.length} registros`);

  // 5. titulos
  const titulos = [
    { id_titulo: 1, descripcion: 'Bachillerato' },
    { id_titulo: 2, descripcion: 'Pasante' },
    { id_titulo: 3, descripcion: 'Licenciatura' },
    { id_titulo: 4, descripcion: 'Maestro' },
    { id_titulo: 5, descripcion: 'Ingeniero' },
    { id_titulo: 6, descripcion: 'Doctorado' },
  ];
  for (const t of titulos) {
    await prisma.titulos.upsert({
      where: { id_titulo: t.id_titulo },
      update: {},
      create: t,
    });
  }
  console.log(`titulos: ${titulos.length} registros`);

  // 6. instituciones (220 registros)
  const instituciones = [
    { id_institucion: 1, nombre: 'Benemérita Universidad Autónoma de Puebla', abreviatura: 'BUAP' },
    { id_institucion: 2, nombre: 'Centro Cultural Universitario Justo Sierra', abreviatura: 'CCUJS' },
    { id_institucion: 3, nombre: 'Centro de Enseñanza Técnica y Superior', abreviatura: 'CETYS' },
    { id_institucion: 4, nombre: 'Centro de Estudio de Alta Dirección', abreviatura: 'CEAD' },
    { id_institucion: 5, nombre: 'Centro de Estudios Básicos y Superiores del Sureste S.C.', abreviatura: 'CEBSS' },
    { id_institucion: 6, nombre: 'Centro de Estudios Científicos y Tecnológicos 14', abreviatura: 'CECyT 14' },
    { id_institucion: 7, nombre: 'Centro de Estudios Científicos y Tecnológicos 9', abreviatura: 'CECyT 9' },
    { id_institucion: 8, nombre: 'Centro de Estudios Superiores CTM', abreviatura: 'CESCTM' },
    { id_institucion: 9, nombre: 'Centro de Estudios Superiores del Estado de Sonora', abreviatura: 'CESES' },
    { id_institucion: 10, nombre: 'Centro de Investigación en Computación IPN', abreviatura: 'CIC' },
    { id_institucion: 11, nombre: 'Centro Universitario de Coatzacoalcos', abreviatura: 'CUCOATZA' },
    { id_institucion: 12, nombre: 'Centro Universitario Hispanoamericano S.C.', abreviatura: 'CUHISPANO' },
    { id_institucion: 13, nombre: 'CONALEP Guanajuato', abreviatura: 'CONALEP GTO' },
    { id_institucion: 14, nombre: 'CONALEP San Luis Potosí', abreviatura: 'CONALEP SLP' },
    { id_institucion: 15, nombre: 'CONALEP Jalisco', abreviatura: 'CONALEP JAL' },
    { id_institucion: 16, nombre: 'CONALEP Estado de México', abreviatura: 'CONALEP EDO' },
    { id_institucion: 17, nombre: 'CONALEP Tlalpan 1', abreviatura: 'CONALEP TL' },
    { id_institucion: 18, nombre: 'Conjunto Educativo S.C.', abreviatura: 'CE' },
    { id_institucion: 19, nombre: 'Dirección General de Educación Tecnológica Industrial', abreviatura: 'DGETI' },
    { id_institucion: 20, nombre: 'Escuela Normal Rural Justo Sierra Méndez', abreviatura: 'SECYD' },
    { id_institucion: 21, nombre: 'Escuela Superior de Cómputo IPN', abreviatura: 'ESCOM' },
    { id_institucion: 22, nombre: 'Fundación Arturo Rosenblueth', abreviatura: 'FAR' },
    { id_institucion: 23, nombre: 'Instituto Artek', abreviatura: 'ARTEK' },
    { id_institucion: 24, nombre: 'Instituto de Ciencias y Estudios Superiores de Tamaulipas A.C.', abreviatura: 'ICEST' },
    { id_institucion: 25, nombre: 'Instituto de Estudios Superiores de Chiapas', abreviatura: 'IESCH' },
    { id_institucion: 26, nombre: 'Instituto de Estudios Superiores de Monterrey Campus Querétaro', abreviatura: 'ITESM QRO' },
    { id_institucion: 27, nombre: 'Instituto de Estudios Superiores de Tamaulipas A.C.', abreviatura: 'IEST' },
    { id_institucion: 28, nombre: 'Instituto Educativo del Noreste A.C.', abreviatura: 'CETYS' },
    { id_institucion: 29, nombre: 'Instituto Galileo de Coatzacoalcos', abreviatura: 'CEUNICO' },
    { id_institucion: 30, nombre: 'Instituto Nacional de Astrofísica, Óptica y Electrónica', abreviatura: 'INAOE' },
    { id_institucion: 31, nombre: 'Instituto Politécnico Nacional (CINVESTAV)', abreviatura: 'CINVESTAV' },
    { id_institucion: 32, nombre: 'Instituto Politécnico Nacional (UPIICSA)', abreviatura: 'UPIICSA' },
    { id_institucion: 33, nombre: 'Instituto Politécnico Nacional (CIC)', abreviatura: 'IPN CIC' },
    { id_institucion: 34, nombre: 'Instituto Politécnico Nacional (ESCOM)', abreviatura: 'IPN ESCOM' },
    { id_institucion: 35, nombre: 'Instituto Politécnico Nacional (CECyT 9)', abreviatura: 'IPN CECyT9' },
    { id_institucion: 36, nombre: 'Instituto Politécnico Nacional (CECyT 14)', abreviatura: 'IPN CECyT14' },
    { id_institucion: 37, nombre: 'Instituto Tecnológico Autónomo de México', abreviatura: 'ITAM' },
    { id_institucion: 38, nombre: 'Instituto Tecnológico de Acapulco', abreviatura: 'IT Acapulco' },
    { id_institucion: 39, nombre: 'Instituto Tecnológico de Aguascalientes', abreviatura: 'IT Ags' },
    { id_institucion: 40, nombre: 'Instituto Tecnológico de Apizaco', abreviatura: 'IT Apizaco' },
    { id_institucion: 41, nombre: 'Instituto Tecnológico de Cancún', abreviatura: 'IT Cancún' },
    { id_institucion: 42, nombre: 'Instituto Tecnológico de Ciudad Valles', abreviatura: 'IT Cd Valles' },
    { id_institucion: 43, nombre: 'Instituto Tecnológico de Celaya', abreviatura: 'IT Celaya' },
    { id_institucion: 44, nombre: 'Instituto Tecnológico de Cerro Azul', abreviatura: 'IT Cerro Azul' },
    { id_institucion: 45, nombre: 'Instituto Tecnológico de Chetumal', abreviatura: 'IT Chetumal' },
    { id_institucion: 46, nombre: 'Instituto Tecnológico de Chihuahua II', abreviatura: 'IT Chih II' },
    { id_institucion: 47, nombre: 'Instituto Tecnológico de Ciudad Guzmán', abreviatura: 'IT Cd Guzmán' },
    { id_institucion: 48, nombre: 'Instituto Tecnológico de Ciudad Juárez', abreviatura: 'IT Cd Juárez' },
    { id_institucion: 49, nombre: 'Instituto Tecnológico de Coatzacoalcos', abreviatura: 'IT Coatz' },
    { id_institucion: 50, nombre: 'Instituto Tecnológico de Comitán', abreviatura: 'IT Comitán' },
    { id_institucion: 51, nombre: 'Instituto Tecnológico de Culiacán', abreviatura: 'IT Culiacán' },
    { id_institucion: 52, nombre: 'Instituto Tecnológico de Estudios Superiores de la Región Carbonífera', abreviatura: 'ITESRC' },
    { id_institucion: 53, nombre: 'Instituto Tecnológico de Estudios Superiores de Zamora', abreviatura: 'ITESZ' },
    { id_institucion: 54, nombre: 'Instituto Tecnológico de Iguala', abreviatura: 'IT Iguala' },
    { id_institucion: 55, nombre: 'Instituto Tecnológico de Jiquilpan', abreviatura: 'IT Jiquilpan' },
    { id_institucion: 56, nombre: 'Instituto Tecnológico de la Laguna', abreviatura: 'IT Laguna' },
    { id_institucion: 57, nombre: 'Instituto Tecnológico de La Paz', abreviatura: 'IT La Paz' },
    { id_institucion: 58, nombre: 'Instituto Tecnológico de Lázaro Cárdenas', abreviatura: 'IT Lázaro C' },
    { id_institucion: 59, nombre: 'Instituto Tecnológico de León', abreviatura: 'IT León' },
    { id_institucion: 60, nombre: 'Instituto Tecnológico de Los Mochis', abreviatura: 'IT Los Mochis' },
    { id_institucion: 61, nombre: 'Instituto Tecnológico de Matamoros', abreviatura: 'IT Matamoros' },
    { id_institucion: 62, nombre: 'Instituto Tecnológico de Mérida', abreviatura: 'IT Mérida' },
    { id_institucion: 63, nombre: 'Instituto Tecnológico de Morelia', abreviatura: 'IT Morelia' },
    { id_institucion: 64, nombre: 'Instituto Tecnológico de Puebla', abreviatura: 'IT Puebla' },
    { id_institucion: 65, nombre: 'Instituto Tecnológico de Puerto Vallarta', abreviatura: 'IT Pto Vallarta' },
    { id_institucion: 66, nombre: 'Instituto Tecnológico de Querétaro', abreviatura: 'IT Querétaro' },
    { id_institucion: 67, nombre: 'Instituto Tecnológico de San Luis Potosí', abreviatura: 'IT SLP' },
    { id_institucion: 68, nombre: 'Instituto Tecnológico de Tehuacán', abreviatura: 'IT Tehuacán' },
    { id_institucion: 69, nombre: 'Instituto Tecnológico de Tepic', abreviatura: 'IT Tepic' },
    { id_institucion: 70, nombre: 'Instituto Tecnológico de Tijuana', abreviatura: 'IT Tijuana' },
    { id_institucion: 71, nombre: 'Instituto Tecnológico de Tlalnepantla', abreviatura: 'IT Tlalnepantla' },
    { id_institucion: 72, nombre: 'Instituto Tecnológico de Zacatecas Norte', abreviatura: 'IT Zac Norte' },
    { id_institucion: 73, nombre: 'Instituto Tecnológico de Zitácuaro', abreviatura: 'IT Zitácuaro' },
    { id_institucion: 74, nombre: 'Instituto Tecnológico del Sur de Guanajuato', abreviatura: 'IT Sur Gto' },
    { id_institucion: 75, nombre: 'Instituto Tecnológico Latinoamericano', abreviatura: 'ITLAT' },
    { id_institucion: 76, nombre: 'Instituto Tecnológico Superior de Acatlán de Osorio', abreviatura: 'ITS Acatlán' },
    { id_institucion: 77, nombre: 'Instituto Tecnológico Superior de Acayucan', abreviatura: 'ITS Acayucan' },
    { id_institucion: 78, nombre: 'Instituto Tecnológico Superior de Alvarado', abreviatura: 'ITS Alvarado' },
    { id_institucion: 79, nombre: 'Instituto Tecnológico Superior de Arandas', abreviatura: 'ITS Arandas' },
    { id_institucion: 80, nombre: 'Instituto Tecnológico Superior de Atlixco', abreviatura: 'ITS Atlixco' },
    { id_institucion: 81, nombre: 'Instituto Tecnológico Superior de Centla', abreviatura: 'ITS Centla' },
    { id_institucion: 82, nombre: 'Instituto Tecnológico Superior de Coatzacoalcos', abreviatura: 'ITS Coatz' },
    { id_institucion: 83, nombre: 'Instituto Tecnológico Superior de Huichapan', abreviatura: 'ITS Huichapan' },
    { id_institucion: 84, nombre: 'Instituto Tecnológico Superior de Irapuato', abreviatura: 'ITS Irapuato' },
    { id_institucion: 85, nombre: 'Instituto Tecnológico Superior de Libres', abreviatura: 'ITS Libres' },
    { id_institucion: 86, nombre: 'Instituto Tecnológico Superior de Los Reyes', abreviatura: 'ITS Los Reyes' },
    { id_institucion: 87, nombre: 'Instituto Tecnológico Superior de Misantla', abreviatura: 'ITS Misantla' },
    { id_institucion: 88, nombre: 'Instituto Tecnológico Superior de Puerto Vallarta', abreviatura: 'ITS Pto Vallarta' },
    { id_institucion: 89, nombre: 'Instituto Tecnológico Superior de Tepeaca', abreviatura: 'ITS Tepeaca' },
    { id_institucion: 90, nombre: 'Instituto Tecnológico Superior de Tepexi de Rodríguez', abreviatura: 'ITS Tepexi' },
    { id_institucion: 91, nombre: 'Instituto Tecnológico Superior de Uruapan', abreviatura: 'ITS Uruapan' },
    { id_institucion: 92, nombre: 'Instituto Tecnológico Superior de Zacatecas Norte', abreviatura: 'ITS Zac Norte' },
    { id_institucion: 93, nombre: 'Instituto Tecnológico Superior de Zapotlanejo', abreviatura: 'ITS Zapotlanejo' },
    { id_institucion: 94, nombre: 'Instituto Tecnológico Superior del Sur de Guanajuato', abreviatura: 'ITS Sur Gto' },
    { id_institucion: 95, nombre: 'Instituto Tecnológico Superior El Grullo', abreviatura: 'ITS El Grullo' },
    { id_institucion: 96, nombre: 'ITESM Campus Querétaro', abreviatura: 'ITESM QRO' },
    { id_institucion: 97, nombre: 'ITESM Campus Estado de México', abreviatura: 'ITESM CEM' },
    { id_institucion: 98, nombre: 'ITESM Campus Ciudad de México', abreviatura: 'ITESM CDMX' },
    { id_institucion: 99, nombre: 'ITESM Campus Monterrey', abreviatura: 'ITESM MTY' },
    { id_institucion: 100, nombre: 'Instituto Tecnológico y de Estudios Superiores de Occidente', abreviatura: 'ITESO' },
    { id_institucion: 101, nombre: 'Universidad IUEM', abreviatura: 'IUEM' },
    { id_institucion: 102, nombre: 'Laboratorio Nacional de Informática Avanzada', abreviatura: 'LANIA' },
    { id_institucion: 103, nombre: 'Latinoamericana de Ciencias y Tecnología A.C.', abreviatura: 'ITLAT' },
    { id_institucion: 104, nombre: 'Universidad del Golfo de México A.C.', abreviatura: 'UGM' },
    { id_institucion: 105, nombre: 'Sun Microsystems de México S.A. de C.V.', abreviatura: 'SUN' },
    { id_institucion: 106, nombre: 'Tecnológico de Estudios Superiores de Coacalco', abreviatura: 'TESCO' },
    { id_institucion: 107, nombre: 'Tecnológico de Estudios Superiores de Cuautitlán Izcalli', abreviatura: 'TESCI' },
    { id_institucion: 108, nombre: 'Tecnológico de Estudios Superiores de Ecatepec', abreviatura: 'TESE' },
    { id_institucion: 109, nombre: 'Universidad Americana de Acapulco', abreviatura: 'UAA Acapulco' },
    { id_institucion: 110, nombre: 'Universidad Autónoma de Aguascalientes', abreviatura: 'UAA' },
    { id_institucion: 111, nombre: 'Universidad Autónoma de Baja California', abreviatura: 'UABC' },
    { id_institucion: 112, nombre: 'Universidad Autónoma de Baja California Sur', abreviatura: 'UABCS' },
    { id_institucion: 113, nombre: 'Universidad Autónoma de Campeche', abreviatura: 'UAC' },
    { id_institucion: 114, nombre: 'Universidad Autónoma de Chiapas', abreviatura: 'UNACH' },
    { id_institucion: 115, nombre: 'Universidad Autónoma de Chihuahua', abreviatura: 'UACH' },
    { id_institucion: 116, nombre: 'Universidad Autónoma de Ciudad Juárez', abreviatura: 'UACJ' },
    { id_institucion: 117, nombre: 'Universidad Autónoma de Coahuila', abreviatura: 'UAdeC' },
    { id_institucion: 118, nombre: 'Universidad Autónoma de Guadalajara Campus Tabasco', abreviatura: 'UAG Tab' },
    { id_institucion: 119, nombre: 'Universidad Autónoma de Guerrero', abreviatura: 'UAGro' },
    { id_institucion: 120, nombre: 'Universidad Autónoma de la Laguna A.C.', abreviatura: 'UAL' },
    { id_institucion: 121, nombre: 'Universidad Autónoma de Nayarit', abreviatura: 'UAN' },
    { id_institucion: 122, nombre: 'Universidad Autónoma de Nuevo León (FCFM)', abreviatura: 'UANL FCFM' },
    { id_institucion: 123, nombre: 'Universidad Autónoma de Nuevo León (FIME)', abreviatura: 'UANL FIME' },
    { id_institucion: 124, nombre: 'Universidad Autónoma de Querétaro', abreviatura: 'UAQ' },
    { id_institucion: 125, nombre: 'Universidad Autónoma de Sinaloa', abreviatura: 'UAS' },
    { id_institucion: 126, nombre: 'Universidad Autónoma de Tamaulipas', abreviatura: 'UAT' },
    { id_institucion: 127, nombre: 'Universidad Autónoma de Yucatán', abreviatura: 'UADY' },
    { id_institucion: 128, nombre: 'Universidad Autónoma del Carmen', abreviatura: 'UNACAR' },
    { id_institucion: 129, nombre: 'Universidad Autónoma del Estado de Hidalgo', abreviatura: 'UAEH' },
    { id_institucion: 130, nombre: 'Universidad Autónoma del Estado de México', abreviatura: 'UAEMex' },
    { id_institucion: 131, nombre: 'Universidad Autónoma del Estado de Morelos', abreviatura: 'UAEMor' },
    { id_institucion: 132, nombre: 'Universidad Autónoma del Noreste A.C.', abreviatura: 'UANE' },
    { id_institucion: 133, nombre: 'Universidad Autónoma Metropolitana', abreviatura: 'UAM' },
    { id_institucion: 134, nombre: 'Universidad de Colima (FCYA Manzanillo)', abreviatura: 'UCol Manz' },
    { id_institucion: 135, nombre: 'Universidad de Colima (Facultad de Telemática)', abreviatura: 'UCol Tele' },
    { id_institucion: 136, nombre: 'Universidad de Cuautitlán Izcalli', abreviatura: 'UCI' },
    { id_institucion: 137, nombre: 'Universidad de Guadalajara (CC)', abreviatura: 'UdG CC' },
    { id_institucion: 138, nombre: 'Universidad de Guadalajara (CUALTOS)', abreviatura: 'UdG CUALTOS' },
    { id_institucion: 139, nombre: 'Universidad de Guadalajara (CUC)', abreviatura: 'UdG CUC' },
    { id_institucion: 140, nombre: 'Universidad de Guadalajara (CUCEA)', abreviatura: 'UdG CUCEA' },
    { id_institucion: 141, nombre: 'Universidad de Guadalajara (CUCEI)', abreviatura: 'UdG CUCEI' },
    { id_institucion: 142, nombre: 'Universidad de Guadalajara (CUCIENEGA)', abreviatura: 'UdG CUCIENEGA' },
    { id_institucion: 143, nombre: 'Universidad de Guadalajara (CUNORTE)', abreviatura: 'UdG CUNORTE' },
    { id_institucion: 144, nombre: 'Universidad de Guadalajara (CUSUR)', abreviatura: 'UdG CUSUR' },
    { id_institucion: 145, nombre: 'Universidad de Guadalajara (CUVALLES)', abreviatura: 'UdG CUVALLES' },
    { id_institucion: 146, nombre: 'Universidad de Guanajuato', abreviatura: 'UGto' },
    { id_institucion: 147, nombre: 'Universidad de Ixtlahuaca CUI A.C.', abreviatura: 'UICUI' },
    { id_institucion: 148, nombre: 'Universidad de La Salle Bajío A.C.', abreviatura: 'La Salle Bajío' },
    { id_institucion: 149, nombre: 'Universidad de León', abreviatura: 'U León' },
    { id_institucion: 150, nombre: 'Universidad de Montemorelos', abreviatura: 'U Montemorelos' },
    { id_institucion: 151, nombre: 'Universidad de Monterrey', abreviatura: 'UDEM' },
    { id_institucion: 152, nombre: 'Universidad de Morelia', abreviatura: 'U Morelia' },
    { id_institucion: 153, nombre: 'Universidad de Occidente', abreviatura: 'UdeO' },
    { id_institucion: 154, nombre: 'Universidad de Quintana Roo', abreviatura: 'UQROO' },
    { id_institucion: 155, nombre: 'Universidad de Sonora', abreviatura: 'UNISON' },
    { id_institucion: 156, nombre: 'Universidad de Sotavento A.C.', abreviatura: 'USotavento' },
    { id_institucion: 157, nombre: 'Universidad del Caribe', abreviatura: 'UCar' },
    { id_institucion: 158, nombre: 'Universidad del Mayab', abreviatura: 'UNIMAYAB' },
    { id_institucion: 159, nombre: 'Universidad del Valle de México', abreviatura: 'UVM' },
    { id_institucion: 160, nombre: 'Universidad del Valle de Puebla S.C.', abreviatura: 'UVP' },
    { id_institucion: 161, nombre: 'Universidad Emilio Cárdenas S.C.', abreviatura: 'UEC' },
    { id_institucion: 162, nombre: 'Universidad Estatal de Sonora', abreviatura: 'UES' },
    { id_institucion: 163, nombre: 'Universidad Iberoamericana Campus CDMX', abreviatura: 'IBERO CDMX' },
    { id_institucion: 164, nombre: 'Universidad Iberoamericana Campus Puebla', abreviatura: 'IBERO Puebla' },
    { id_institucion: 165, nombre: 'Universidad Insurgentes S.C.', abreviatura: 'UINSURG' },
    { id_institucion: 166, nombre: 'Universidad Intercontinental', abreviatura: 'UIC' },
    { id_institucion: 167, nombre: 'Universidad Juárez Autónoma de Tabasco (DACB)', abreviatura: 'UJAT DACB' },
    { id_institucion: 168, nombre: 'Universidad Juárez Autónoma de Tabasco (DACyTI)', abreviatura: 'UJAT DACyTI' },
    { id_institucion: 169, nombre: 'Universidad Juárez Autónoma de Tabasco (DAIS)', abreviatura: 'UJAT DAIS' },
    { id_institucion: 170, nombre: 'Universidad La Salle A.C. CDMX', abreviatura: 'La Salle CDMX' },
    { id_institucion: 171, nombre: 'Universidad Latina de América A.C.', abreviatura: 'UNLA' },
    { id_institucion: 172, nombre: 'Universidad Loyola del Pacífico', abreviatura: 'ULP' },
    { id_institucion: 173, nombre: 'Universidad Mesoamericana de San Agustín', abreviatura: 'UMSA' },
    { id_institucion: 174, nombre: 'Universidad México Americana del Norte A.C.', abreviatura: 'UMAN' },
    { id_institucion: 175, nombre: 'Universidad Nacional Autónoma de México (DGTIC)', abreviatura: 'UNAM DGTIC' },
    { id_institucion: 176, nombre: 'Universidad Nacional Autónoma de México (Fac. de Ciencias)', abreviatura: 'UNAM FC' },
    { id_institucion: 177, nombre: 'Universidad Nacional Autónoma de México (FES Cuautitlán)', abreviatura: 'UNAM FES Cuaut' },
    { id_institucion: 178, nombre: 'Universidad Nacional Autónoma de México (FES Acatlán)', abreviatura: 'UNAM FES Acatlán' },
    { id_institucion: 179, nombre: 'Universidad Nacional Autónoma de México (FES Aragón)', abreviatura: 'UNAM FES Aragón' },
    { id_institucion: 180, nombre: 'Universidad Pablo Guardado Chávez S.C.', abreviatura: 'UPGC' },
    { id_institucion: 181, nombre: 'Universidad Panamericana', abreviatura: 'UP' },
    { id_institucion: 182, nombre: 'Universidad Politécnica de Aguascalientes', abreviatura: 'UPA' },
    { id_institucion: 183, nombre: 'Universidad Politécnica de San Luis Potosí', abreviatura: 'UPSLP' },
    { id_institucion: 184, nombre: 'Universidad Politécnica de Zacatecas', abreviatura: 'UPZ' },
    { id_institucion: 185, nombre: 'Universidad Politécnica Metropolitana de Hidalgo', abreviatura: 'UPMH' },
    { id_institucion: 186, nombre: 'Universidad Popular Autónoma del Estado de Puebla', abreviatura: 'UPAEP' },
    { id_institucion: 187, nombre: 'Universidad Regiomontana A.C.', abreviatura: 'UR' },
    { id_institucion: 188, nombre: 'Universidad Regional del Sureste A.C.', abreviatura: 'URSE' },
    { id_institucion: 189, nombre: 'Universidad Simón Bolívar', abreviatura: 'USB' },
    { id_institucion: 190, nombre: 'Universidad Tecnológica Americana', abreviatura: 'UTAM' },
    { id_institucion: 191, nombre: 'Universidad Tecnológica de Calvillo', abreviatura: 'UT Calvillo' },
    { id_institucion: 192, nombre: 'Universidad Tecnológica de Campeche', abreviatura: 'UT Campeche' },
    { id_institucion: 193, nombre: 'Universidad Tecnológica de Cancún', abreviatura: 'UT Cancún' },
    { id_institucion: 194, nombre: 'Universidad Tecnológica de Huejotzingo', abreviatura: 'UT Huejotzingo' },
    { id_institucion: 195, nombre: 'Universidad Tecnológica de Jalisco', abreviatura: 'UT Jalisco' },
    { id_institucion: 196, nombre: 'Universidad Tecnológica de la Mixteca', abreviatura: 'UTM' },
    { id_institucion: 197, nombre: 'Universidad Tecnológica de la Selva', abreviatura: 'UT Selva' },
    { id_institucion: 198, nombre: 'Universidad Tecnológica de la Sierra Hidalguense', abreviatura: 'UTSH' },
    { id_institucion: 199, nombre: 'Universidad Tecnológica de León', abreviatura: 'UT León' },
    { id_institucion: 200, nombre: 'Universidad Tecnológica de Orizaba', abreviatura: 'UT Orizaba' },
    { id_institucion: 201, nombre: 'Universidad Tecnológica de México', abreviatura: 'UNITEC' },
    { id_institucion: 202, nombre: 'Universidad Tecnológica de Morelia', abreviatura: 'UT Morelia' },
    { id_institucion: 203, nombre: 'Universidad Tecnológica de Nezahualcóyotl', abreviatura: 'UT Neza' },
    { id_institucion: 204, nombre: 'Universidad Tecnológica de Puebla', abreviatura: 'UT Puebla' },
    { id_institucion: 205, nombre: 'Universidad Tecnológica de Tabasco', abreviatura: 'UT Tabasco' },
    { id_institucion: 206, nombre: 'Universidad Tecnológica de Tulancingo', abreviatura: 'UT Tulancingo' },
    { id_institucion: 207, nombre: 'Universidad Tecnológica de Tula-Tepeji', abreviatura: 'UTTT' },
    { id_institucion: 208, nombre: 'Universidad Tecnológica de Xicotepec de Juárez', abreviatura: 'UT Xicotepec' },
    { id_institucion: 209, nombre: 'Universidad Tecnológica del Estado de Zacatecas', abreviatura: 'UTEZ' },
    { id_institucion: 210, nombre: 'Universidad Tecnológica del Suroeste de Guanajuato', abreviatura: 'UTSEG' },
    { id_institucion: 211, nombre: 'Universidad Tecnológica del Norte de Aguascalientes', abreviatura: 'UTNA' },
    { id_institucion: 212, nombre: 'Universidad Tecnológica del Norte de Guanajuato', abreviatura: 'UTNG' },
    { id_institucion: 213, nombre: 'Universidad Tecnológica del Valle del Mezquital', abreviatura: 'UTVM' },
    { id_institucion: 214, nombre: 'Universidad Tecnológica Fidel Velázquez', abreviatura: 'UTFV' },
    { id_institucion: 215, nombre: 'Universidad Tecnológica Tula-Tepeji', abreviatura: 'UTTT' },
    { id_institucion: 216, nombre: 'Universidad Valle del Grijalva A.C.', abreviatura: 'UVG' },
    { id_institucion: 217, nombre: 'Universidad Vasco de Quiroga A.C.', abreviatura: 'UVQ' },
    { id_institucion: 218, nombre: 'Universidad Veracruzana (Campus Coatzacoalcos)', abreviatura: 'UV Coatz' },
    { id_institucion: 219, nombre: 'Universidad Veracruzana (Fac. Estadística e Informática)', abreviatura: 'UV FEI' },
    { id_institucion: 220, nombre: 'Universidad de Ixtlahuaca UI-CUI', abreviatura: 'UICUI' },
  ];
  for (const i of instituciones) {
    await prisma.instituciones.upsert({
      where: { id_institucion: i.id_institucion },
      update: {},
      create: i,
    });
  }
  console.log(`instituciones: ${instituciones.length} registros`);

  // 7. tipo_participante
  const tipoParticipante = [
    { id_tipo_participante: 1, descripcion: 'Alumno', clave: 'ALUMNO', orden: 1 },
    { id_tipo_participante: 2, descripcion: 'Académico', clave: 'ACADEMICO', orden: 2 },
    { id_tipo_participante: 3, descripcion: 'Ponente', clave: 'PONENTE', orden: 3 },
  ];
  for (const t of tipoParticipante) {
    await prisma.tipo_participante.upsert({
      where: { id_tipo_participante: t.id_tipo_participante },
      update: {},
      create: t,
    });
  }
  console.log(`tipo_participante: ${tipoParticipante.length} registros`);

  // 8. precios_inscripcion
  const precios = [
    { id: 1, id_tipo_participante: 1, es_afiliada: true, fecha_limite: new Date('2026-01-01T00:00:00Z'), costo: 400.00, orden: 1, activo: true },
    { id: 2, id_tipo_participante: 1, es_afiliada: true, fecha_limite: new Date('2026-09-20T00:00:00Z'), costo: 450.00, orden: 2, activo: true },
    { id: 3, id_tipo_participante: 1, es_afiliada: false, fecha_limite: new Date('2026-01-01T00:00:00Z'), costo: 450.00, orden: 1, activo: true },
    { id: 4, id_tipo_participante: 1, es_afiliada: false, fecha_limite: new Date('2026-09-20T00:00:00Z'), costo: 500.00, orden: 2, activo: true },
    { id: 5, id_tipo_participante: 2, es_afiliada: true, fecha_limite: new Date('2026-01-01T00:00:00Z'), costo: 550.00, orden: 1, activo: true },
    { id: 6, id_tipo_participante: 2, es_afiliada: true, fecha_limite: new Date('2026-09-20T00:00:00Z'), costo: 600.00, orden: 2, activo: true },
    { id: 7, id_tipo_participante: 2, es_afiliada: false, fecha_limite: new Date('2026-01-01T00:00:00Z'), costo: 600.00, orden: 1, activo: true },
    { id: 8, id_tipo_participante: 2, es_afiliada: false, fecha_limite: new Date('2026-09-20T00:00:00Z'), costo: 650.00, orden: 2, activo: true },
    { id: 9, id_tipo_participante: 3, es_afiliada: true, fecha_limite: new Date('2026-01-01T00:00:00Z'), costo: 2780.00, orden: 1, activo: true },
    { id: 10, id_tipo_participante: 3, es_afiliada: true, fecha_limite: new Date('2026-09-20T00:00:00Z'), costo: 3150.00, orden: 2, activo: true },
    { id: 11, id_tipo_participante: 3, es_afiliada: false, fecha_limite: new Date('2026-01-01T00:00:00Z'), costo: 3150.00, orden: 1, activo: true },
    { id: 12, id_tipo_participante: 3, es_afiliada: false, fecha_limite: new Date('2026-09-20T00:00:00Z'), costo: 3700.00, orden: 2, activo: true },
  ];
  for (const p of precios) {
    await prisma.precios_inscripcion.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }
  console.log(`precios_inscripcion: ${precios.length} registros`);

  console.log('Seed completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
