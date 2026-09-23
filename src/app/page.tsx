import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/perfil");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <main className="w-full max-w-2xl text-center">
        <div className="rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-gray-900/5 sm:p-14">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Congreso ANIEI 2026
          </h1>
          <p className="mb-10 text-lg leading-relaxed text-gray-600">
            Bienvenido al Sistema de Inscripción al Congreso Nacional de la
            Asociación Nacional de Instituciones de Educación en Informática.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-xl bg-white px-8 py-4 text-lg font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 transition-all hover:bg-gray-50 hover:ring-gray-400 sm:w-auto"
            >
              Ya me registré
            </Link>
            <Link
              href="/registro"
              className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 sm:w-auto"
            >
              Registrarse al congreso
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
