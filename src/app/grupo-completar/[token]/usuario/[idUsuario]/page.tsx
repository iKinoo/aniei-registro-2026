import { notFound } from 'next/navigation';
import { prisma } from '@/infrastructure/database/client';
import { CompletarRegistroForm } from './CompletarRegistroForm';

export const metadata = { title: 'Completar Registro Alumno | ANIEI 2026' };

export default async function UsuarioCompletarPage(props: { params: Promise<{ token: string; idUsuario: string }> }) {
  const { token, idUsuario } = await props.params;
  const idNum = Number(idUsuario);

  if (isNaN(idNum)) return notFound();

  // Find group and verify user is in it and needs completion
  const grupo = await prisma.grupos_registro.findUnique({
    where: { token },
    include: {
      responsable: true,
      miembros: {
        where: { id_usuario: idNum }
      },
    },
  });

  if (!grupo || grupo.miembros.length === 0) {
    notFound();
  }

  const usuario = grupo.miembros[0];
  if (!usuario.correo.includes('@temp.aniei.org')) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow text-center">
          <h2 className="text-xl font-bold text-gray-900">Registro Ya Completado</h2>
          <p className="mt-2 text-gray-600">Este usuario ya ha completado su registro. Por favor inicia sesión normalmente o verifica el correo electrónico registrado.</p>
          <a href="/login" className="mt-4 block underline text-indigo-600">Ir a Iniciar Sesión</a>
        </div>
      </div>
    );
  }

  // Load catalogs
  const [dbCargos, dbEstados, dbInstituciones] = await Promise.all([
    prisma.cargos.findMany({ orderBy: { descripcion: 'asc' } }),
    prisma.estados.findMany({ orderBy: { nombre: 'asc' } }),
    prisma.instituciones.findMany({ orderBy: { nombre: 'asc' } }),
  ]);

  const cargos = dbCargos.map(C => ({ idCargo: C.id_cargo, descripcion: C.descripcion }));
  const estados = dbEstados.map(E => ({ idEntidadFederativa: E.id_entidad_federativa, nombre: E.nombre }));
  const instituciones = dbInstituciones.map(I => ({ 
    idInstitucion: I.id_institucion, 
    nombre: I.nombre,
    abreviatura: I.abreviatura
  }));

  const catalogos = { cargos, estados, instituciones };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-indigo-600 text-white">
            <h3 className="text-lg leading-6 font-medium">Reclama tu cuenta</h3>
            <p className="mt-1 text-sm text-indigo-100">
              Registrado mediante: {grupo.responsable.nombre} {grupo.responsable.apellido}
            </p>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 m-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Estás completando el registro para: <strong className="font-bold">{usuario.nombre} {usuario.apellido}</strong>. 
                  Una vez que proporciones tu correo real, enviaremos tus datos de acceso a él automáticamente.
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 py-5 sm:p-6 pt-0">
            <CompletarRegistroForm token={token} idUsuario={idNum} catalogos={catalogos} />
          </div>
        </div>
      </div>
    </div>
  );
}
