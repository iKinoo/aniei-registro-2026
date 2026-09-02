import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

const BLUE_DARK = '#1a3a5c';
const BLUE_LIGHT = '#3b82f6';
const GRAY_LIGHT = '#f1f5f9';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    padding: 60,
  },
  header: {
    marginBottom: 40,
    borderBottomWidth: 3,
    borderBottomColor: BLUE_LIGHT,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: BLUE_DARK,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
  },
  recipientSection: {
    marginBottom: 30,
    width: '100%',
  },
  recipientLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  recipientName: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: BLUE_DARK,
    textAlign: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: GRAY_LIGHT,
    borderRadius: 4,
  },
  description: {
    fontSize: 14,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 1.8,
    maxWidth: 500,
    marginVertical: 20,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  date: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
  multipleRecipients: {
    marginTop: 20,
    width: '100%',
  },
  recipientItem: {
    fontSize: 14,
    color: BLUE_DARK,
    textAlign: 'center',
    marginVertical: 4,
  },
});

export interface ManualConstanciaTemplateProps {
  tipoConstancia: string;
  destinatarios: string[];
  descripcion: string;
  fecha: string;
}

export function ManualConstanciaTemplate({
  tipoConstancia,
  destinatarios,
  descripcion,
  fecha,
}: ManualConstanciaTemplateProps) {
  const esUnico = destinatarios.length === 1;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>CONSTANCIA</Text>
          <Text style={styles.subtitle}>{tipoConstancia}</Text>
        </View>

        <View style={styles.content}>
          {esUnico ? (
            <View style={styles.recipientSection}>
              <Text style={styles.recipientLabel}>Se otorga la presente constancia a:</Text>
              <View style={styles.recipientName}>
                <Text style={styles.recipientName}>{destinatarios[0]}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.recipientSection}>
              <Text style={styles.recipientLabel}>Se otorga la presente constancia a:</Text>
              <View style={styles.multipleRecipients}>
                {destinatarios.map((nombre, index) => (
                  <Text key={index} style={styles.recipientItem}>
                    {nombre}
                  </Text>
                ))}
              </View>
            </View>
          )}

          <Text style={styles.description}>{descripcion}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.date}>Fecha de emisión: {fecha}</Text>
        </View>
      </Page>
    </Document>
  );
}
