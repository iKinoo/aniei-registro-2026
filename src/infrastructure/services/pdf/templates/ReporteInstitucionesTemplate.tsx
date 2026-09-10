import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const BLUE_DARK = '#1a3a5c';
const BLUE_LIGHT = '#3b82f6';
const GRAY_LIGHT = '#f8fafc';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 3,
    borderBottomColor: BLUE_LIGHT,
    paddingBottom: 15,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: BLUE_DARK,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  summary: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 25,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: GRAY_LIGHT,
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: BLUE_DARK,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: BLUE_DARK,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  headerText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  colNum: { width: 35 },
  colNombre: { flex: 3 },
  colTotal: { flex: 1, textAlign: 'right' as const },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableRowAlt: {
    backgroundColor: GRAY_LIGHT,
  },
  cellText: {
    fontSize: 9,
    color: '#334155',
  },
  cellTextRight: {
    fontSize: 9,
    color: '#334155',
    textAlign: 'right' as const,
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center' as const,
  },
});

export interface InstitucionReporteData {
  numero: number;
  nombre: string;
  totalParticipantes: number;
}

export interface ReporteInstitucionesData {
  totalInstituciones: number;
  totalParticipantes: number;
  instituciones: InstitucionReporteData[];
}

export function ReporteInstitucionesTemplate({ data }: { data: ReporteInstitucionesData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Instituciones Participantes</Text>
          <Text style={styles.subtitle}>Congreso ANIEI 2026</Text>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryNumber}>{data.totalInstituciones}</Text>
            <Text style={styles.summaryLabel}>Instituciones</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryNumber}>{data.totalParticipantes}</Text>
            <Text style={styles.summaryLabel}>Participantes</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, styles.colNum]}>#</Text>
          <Text style={[styles.headerText, styles.colNombre]}>Institución</Text>
          <Text style={[styles.headerText, styles.colTotal]}>Participantes</Text>
        </View>

        {data.instituciones.map((inst, index) => (
          <View key={inst.numero} style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}>
            <Text style={[styles.cellText, styles.colNum]}>{inst.numero}</Text>
            <Text style={[styles.cellText, styles.colNombre]}>{inst.nombre}</Text>
            <Text style={[styles.cellTextRight, styles.colTotal]}>{inst.totalParticipantes}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Documento generado el {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
