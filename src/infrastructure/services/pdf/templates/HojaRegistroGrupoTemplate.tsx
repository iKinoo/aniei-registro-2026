import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#E4E4E4', padding: 40 },
  section: { margin: 10, padding: 10, flexGrow: 1, backgroundColor: '#FFF', borderRadius: 5 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a365d' },
  subtitle: { fontSize: 14, color: '#4a5568', marginTop: 5 },
  responsableBox: { backgroundColor: '#f0f4f8', padding: 10, borderRadius: 5, marginBottom: 20 },
  responsableLabel: { fontSize: 10, color: '#718096' },
  responsableName: { fontSize: 14, fontWeight: 'bold' },
  memberList: { marginTop: 10 },
  memberRow: { flexDirection: 'row', borderBottom: '1 solid #e2e8f0', paddingVertical: 8 },
  memberName: { fontSize: 12 },
  memberNumber: { fontSize: 12, width: 30, color: '#718096' },
  qrContainer: { alignItems: 'center', marginTop: 30, padding: 20, backgroundColor: '#f8fafc', borderRadius: 8 },
  qrTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  qrSubtitle: { fontSize: 10, color: '#718096', marginBottom: 15, textAlign: 'center' },
  qrImage: { width: 150, height: 150 },
  linkText: { fontSize: 10, color: '#3182ce', marginTop: 10 }
});

export const HojaRegistroGrupoTemplate = ({
  token,
  nombres,
  responsableNombre,
  qrDataUrl
}: {
  token: string;
  nombres: string[];
  responsableNombre: string;
  qrDataUrl: string;
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Registro Grupal Rápido</Text>
            <Text style={styles.subtitle}>Congreso ANIEI 2026</Text>
          </View>
        </View>

        <View style={styles.responsableBox}>
          <Text style={styles.responsableLabel}>Registrado por</Text>
          <Text style={styles.responsableName}>{responsableNombre}</Text>
        </View>

        <View style={styles.qrContainer}>
          <Text style={styles.qrTitle}>Termina tu Registro</Text>
          <Text style={styles.qrSubtitle}>
            Escanea este código QR con tu celular. Te mostraremos esta lista de participantes. 
            Selecciona tu nombre y completa tu registro para activar tu cuenta y acceder al portal.
          </Text>
          <Image src={qrDataUrl} style={styles.qrImage} />
        </View>

        <View style={{ marginTop: 30 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Lista de Participantes ({nombres.length})</Text>
          <View style={styles.memberList}>
            {nombres.map((nombre, index) => (
              <View key={index} style={styles.memberRow}>
                <Text style={styles.memberNumber}>{index + 1}.</Text>
                <Text style={styles.memberName}>{nombre}</Text>
              </View>
            ))}
          </View>
        </View>

      </View>
    </Page>
  </Document>
);
