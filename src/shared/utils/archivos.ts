export function extraerRutaArchivo(valor: string): string {
  const indice = valor.indexOf('/api/archivos/');
  if (indice >= 0) {
    return decodeURIComponent(valor.slice(indice + '/api/archivos/'.length).split('?')[0]);
  }
  return valor;
}
