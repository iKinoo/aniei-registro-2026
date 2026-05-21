import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontFamily: 'Helvetica',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    textAlign: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a2e',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
  },
  body: {
    marginTop: 30,
    fontSize: 18,
    lineHeight: 1.8,
    color: '#333',
    textAlign: 'center',
    width: '80%',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
    marginBottom: 20,
    borderBottom: '2px solid #ccc',
    paddingBottom: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 12,
    color: '#777',
  },
});

export interface ConstanciaParticipanteTemplateProps {
  nombre: string;
  apellido: string;
  tipoActividad: string;
  nombreActividad: string;
  fecha: string;
}

export function ConstanciaParticipanteTemplate(props: ConstanciaParticipanteTemplateProps) {
  return (
    <Document>
      <Page size="LETTER" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>CONSTANCIA DE PARTICIPACIÓN</Text>
          <Text style={styles.subtitle}>Congreso ANIEI 2026</Text>
        </View>

        <View style={styles.body}>
          <Text>
            El Comité Organizador otorga la presente constancia a
          </Text>
          <Text style={styles.name}>
            {props.nombre} {props.apellido}
          </Text>
          <Text>
            por su participación en la {props.tipoActividad.toLowerCase()} titulada:
          </Text>
          <Text style={{ marginTop: 15, fontStyle: 'italic', fontWeight: 'bold' }}>
            "{props.nombreActividad}"
          </Text>
        </View>

        <Text style={styles.footer}>
          ANIEI 2026 — Asociación Nacional de Instituciones de Educación en Informática
          {"\n"}Emitida el {props.fecha}
        </Text>
      </Page>
    </Document>
  );
}
