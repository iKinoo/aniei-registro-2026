import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';
import type { ReporteTalleristasPdfData } from '@/application/ports/IPdfService';

const BLUE_DARK = '#1a3a5c';
const BLUE_LIGHT = '#3b82f6';
const GRAY_LIGHT = '#f8fafc';

const permitirSaltos = (texto: string, maximo: number) => {
  if (texto.length <= maximo) return texto;
  const lineas: string[] = [];
  let resto = texto;
  while (resto.length > maximo) {
    let corte = maximo;
    for (let i = maximo; i > maximo / 2; i -= 1) {
      if ('/?&=._@-'.includes(resto[i - 1])) {
        corte = i;
        break;
      }
    }
    lineas.push(resto.slice(0, corte));
    resto = resto.slice(corte);
  }
  lineas.push(resto);
  return lineas.join('\n');
};

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 35,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 22,
    borderBottomWidth: 3,
    borderBottomColor: BLUE_LIGHT,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: BLUE_DARK,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
  },
  summary: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: GRAY_LIGHT,
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: BLUE_DARK,
  },
  summaryLabel: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: BLUE_DARK,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  headerText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  colNum: { width: '4%' },
  colFolio: { width: '10%' },
  colNombre: { width: '16%' },
  colTaller: { width: '20%' },
  colModalidad: { width: '9%' },
  colCorreo: { width: '18%' },
  colLugar: { width: '23%' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableRowAlt: {
    backgroundColor: GRAY_LIGHT,
  },
  cellText: {
    fontSize: 7,
    color: '#334155',
    paddingRight: 4,
  },
  cellLink: {
    color: BLUE_LIGHT,
    textDecoration: 'underline',
  },
  footer: {
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 8,
    color: '#64748b',
    textAlign: 'center' as const,
  },
});

const FILAS_POR_PAGINA = 12;

export function ReporteTalleristasTemplate({ data }: { data: ReporteTalleristasPdfData }) {
  const paginas = Array.from(
    { length: Math.max(1, Math.ceil(data.talleristas.length / FILAS_POR_PAGINA)) },
    (_, indice) => data.talleristas.slice(indice * FILAS_POR_PAGINA, (indice + 1) * FILAS_POR_PAGINA),
  );

  return (
    <Document>
      {paginas.map((filas, indicePagina) => (
        <Page key={indicePagina} size="A4" orientation="landscape" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {indicePagina === 0 ? 'Reporte de Talleristas' : 'Reporte de Talleristas (continuación)'}
            </Text>
            <Text style={styles.subtitle}>Congreso ANIEI 2026</Text>
          </View>

          {indicePagina === 0 && (
            <View style={styles.summary}>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryNumber}>{data.totalTalleres}</Text>
                <Text style={styles.summaryLabel}>Talleres</Text>
              </View>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryNumber}>{data.totalTalleristas}</Text>
                <Text style={styles.summaryLabel}>Talleristas</Text>
              </View>
            </View>
          )}

          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.colNum]}>#</Text>
            <Text style={[styles.headerText, styles.colFolio]}>Folio</Text>
            <Text style={[styles.headerText, styles.colNombre]}>Tallerista</Text>
            <Text style={[styles.headerText, styles.colTaller]}>Taller</Text>
            <Text style={[styles.headerText, styles.colModalidad]}>Modalidad</Text>
            <Text style={[styles.headerText, styles.colCorreo]}>Correo</Text>
            <Text style={[styles.headerText, styles.colLugar]}>Liga / Lugar</Text>
          </View>

          {filas.map((t, index) => (
            <View key={t.numero} style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.cellText, styles.colNum]}>{t.numero}</Text>
              <Text style={[styles.cellText, styles.colFolio]}>{t.folio}</Text>
              <Text style={[styles.cellText, styles.colNombre]}>{t.nombre}</Text>
              <Text style={[styles.cellText, styles.colTaller]}>{t.taller}</Text>
              <Text style={[styles.cellText, styles.colModalidad]}>
                {t.modalidad === 'VIRTUAL' ? 'Virtual' : 'Presencial'}
              </Text>
              <Text style={[styles.cellText, styles.colCorreo]}>{permitirSaltos(t.correo, 32)}</Text>
              {t.modalidad === 'VIRTUAL' && t.ligaOLugar !== 'Sin liga' ? (
                <Link src={t.ligaOLugar} style={[styles.cellText, styles.cellLink, styles.colLugar]}>
                  {permitirSaltos(t.ligaOLugar, 40)}
                </Link>
              ) : (
                <Text style={[styles.cellText, styles.colLugar]}>{t.ligaOLugar}</Text>
              )}
            </View>
          ))}

          {indicePagina === paginas.length - 1 && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Documento generado el {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </View>
          )}
        </Page>
      ))}
    </Document>
  );
}
