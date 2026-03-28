import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
  },
  divider: {
    borderBottom: '2px solid #1a1a2e',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottom: '1px solid #eee',
  },
  label: {
    width: '35%',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
  },
  value: {
    width: '65%',
    fontSize: 12,
    color: '#333',
  },
  body: {
    marginTop: 24,
    fontSize: 11,
    lineHeight: 1.6,
    color: '#444',
    textAlign: 'justify',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 9,
    color: '#aaa',
  },
});

export interface ConstanciaTemplateProps {
  nombre: string;
  apellido: string;
  folio: string;
  institucion: string;
  tipoUsuario: string;
  fecha: string;
}

export function ConstanciaTemplate(props: ConstanciaTemplateProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>CONSTANCIA DE INSCRIPCIÓN</Text>
          <Text style={styles.subtitle}>Congreso ANIEI 2026</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Nombre:</Text>
          <Text style={styles.value}>{props.nombre} {props.apellido}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Folio:</Text>
          <Text style={styles.value}>{props.folio}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Institución:</Text>
          <Text style={styles.value}>{props.institucion}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Tipo de participante:</Text>
          <Text style={styles.value}>{props.tipoUsuario}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Fecha de registro:</Text>
          <Text style={styles.value}>{props.fecha}</Text>
        </View>

        <View style={styles.body}>
          <Text>
            Se hace constar que {props.nombre} {props.apellido} se encuentra
            debidamente inscrito(a) al Congreso Nacional ANIEI 2026, con el folio de
            registro {props.folio}.
          </Text>
        </View>

        <Text style={styles.footer}>
          ANIEI 2026 — Asociación Nacional de Instituciones de Educación en Informática
        </Text>
      </Page>
    </Document>
  );
}
