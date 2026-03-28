export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <main className="w-full max-w-lg px-4 py-16 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Congreso ANIEI 2026
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          Sistema de Inscripción al Congreso Nacional de la Asociación Nacional
          de Instituciones de Educación en Informática
        </p>
        <a
          href="/registro"
          className="inline-block rounded-lg bg-blue-600 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-blue-700"
        >
          Inscribirse al congreso
        </a>
      </main>
    </div>
  );
}
