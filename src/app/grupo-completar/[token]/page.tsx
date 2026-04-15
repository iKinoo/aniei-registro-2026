import { notFound } from 'next/navigation';
import { prisma } from '@/infrastructure/database/client';
import Link from 'next/link';

export const metadata = { title: 'Completar Registro | ANIEI 2026' };

export default async function GrupoCompletarPage(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params;

  const grupo = await prisma.grupos_registro.findUnique({
    where: { token },
    include: {
      responsable: true,
      miembros: true,
    },
  });

  if (!grupo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Registro NO ENCONTRADO</h2>
          <p className="text-gray-600 mb-8">
            El enlace de registro de grupo es inválido o no existe en la base de datos.
          </p>
          <Link
            href="/"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  const pendientes = grupo.miembros.filter(m => m.correo.includes('@temp.aniei.org'));
  const completados = grupo.miembros.filter(m => !m.correo.includes('@temp.aniei.org'));


  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-indigo-600 text-white">
            <h3 className="text-lg leading-6 font-medium">Registro Grupal</h3>
            <p className="mt-1 max-w-2xl text-sm text-indigo-100">
              Registrado por {grupo.responsable.nombre} {grupo.responsable.apellido}
            </p>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:px-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Integrantes pendientes de completar registro</h4>
                {pendientes.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay integrantes pendientes.</p>
                ) : (
                  <ul className="divide-y divide-gray-200 border rounded-md border-gray-200">
                    {pendientes.map((miembro) => (
                      <li key={miembro.id_usuario} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <span className="ml-2 flex-1 w-0 truncate">
                            {miembro.nombre} {miembro.apellido}
                          </span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <Link
                            href={`/grupo-completar/${token}/usuario/${miembro.id_usuario}`}
                            className="font-medium text-indigo-600 hover:text-indigo-500 bg-indigo-50 px-3 py-1 pb-1.5 rounded-full"
                          >
                            Terminar registro
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {completados.length > 0 && (
                <div className="py-4 sm:py-5 sm:px-6 bg-gray-50">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Integrantes con registro completado</h4>
                  <ul className="divide-y divide-gray-200 border rounded-md border-gray-200 bg-white">
                    {completados.map((miembro) => (
                      <li key={miembro.id_usuario} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center text-green-600">
                          <svg className="flex-shrink-0 h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="">
                            {miembro.nombre} {miembro.apellido}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
