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
  infoBox: {
    backgroundColor: GRAY_LIGHT,
    padding: 12,
    borderRadius: 4,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 10,
    color: '#64748b',
    width: 100,
  },
  infoValue: {
    fontSize: 10,
    color: BLUE_DARK,
    fontFamily: 'Helvetica-Bold',
    flex: 1,
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
  colNombre: { flex: 2 },
  colCorreo: { flex: 2 },
  colFecha: { flex: 1 },
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
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center',
  },
});

export interface ListaParticipantesData {
  nombreActividad: string;
  tipoActividad: string;
  fecha: string;
  participantes: {
    numero: number;
    nombre: string;
    correo: string;
    fechaInscripcion: string;
  }[];
}

export function ListaParticipantesTemplate({ data }: { data: ListaParticipantesData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Lista de Participantes</Text>
          <Text style={styles.subtitle}>Congreso ANIEI 2026</Text>
        </View>

        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Actividad:</Text>
            <Text style={styles.infoValue}>{data.nombreActividad}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tipo:</Text>
            <Text style={styles.infoValue}>{data.tipoActividad}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha:</Text>
            <Text style={styles.infoValue}>{data.fecha}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total:</Text>
            <Text style={styles.infoValue}>{data.participantes.length} participante(s)</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, styles.colNum]}>#</Text>
          <Text style={[styles.headerText, styles.colNombre]}>Nombre</Text>
          <Text style={[styles.headerText, styles.colCorreo]}>Correo</Text>
          <Text style={[styles.headerText, styles.colFecha]}>Inscripción</Text>
        </View>

        {data.participantes.map((p, index) => (
          <View key={p.numero} style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}>
            <Text style={[styles.cellText, styles.colNum]}>{p.numero}</Text>
            <Text style={[styles.cellText, styles.colNombre]}>{p.nombre}</Text>
            <Text style={[styles.cellText, styles.colCorreo]}>{p.correo}</Text>
            <Text style={[styles.cellText, styles.colFecha]}>{p.fechaInscripcion}</Text>
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
