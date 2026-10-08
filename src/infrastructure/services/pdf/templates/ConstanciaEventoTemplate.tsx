import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { ContenidoConstancia, LineaConstancia } from '@/application/dtos/ConstanciaDTO';

Font.registerHyphenationCallback((palabra) => [palabra]);

let _bgCache: string | null = null;

function getBackgroundImage(): string {
  if (_bgCache) return _bgCache;
  const bgPath = join(process.cwd(), 'public', 'aniei_reconocimiento_fondo.jpeg');
  const buffer = readFileSync(bgPath);
  _bgCache = `data:image/jpeg;base64,${buffer.toString('base64')}`;
  return _bgCache;
}

const NEGRO = '#000000';

const FIRMAS_CONSTANCIA = ['Firma 1', 'Firma 2', 'Firma 3'];

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fff',
    fontFamily: 'Helvetica',
  },
  container: {
    position: 'relative',
    width: 842,
    height: 595,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 842,
    height: 595,
  },
  cuerpoBox: {
    position: 'absolute',
    top: 248,
    left: 104,
    right: 104,
  },
  nombre: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: NEGRO,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 1.3,
  },
  lineaCentrada: {
    fontSize: 18,
    color: NEGRO,
    textAlign: 'center',
    lineHeight: 1.35,
    marginBottom: 10,
  },
  lineaJustificada: {
    fontSize: 18,
    color: NEGRO,
    textAlign: 'justify',
    lineHeight: 1.35,
    marginBottom: 10,
  },
  segmento: {
    fontFamily: 'Helvetica',
  },
  segmentoNegrita: {
    fontFamily: 'Helvetica-Bold',
  },
  firmas: {
    position: 'absolute',
    bottom: 42,
    left: 120,
    right: 120,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  firmaColumna: {
    width: 200,
    alignItems: 'center',
  },
  firmaLinea: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: NEGRO,
    marginBottom: 5,
  },
  firmaLabel: {
    fontSize: 12,
    color: NEGRO,
    textAlign: 'center',
  },
});

function renderLinea(linea: LineaConstancia, index: number) {
  return (
    <Text key={index} style={linea.alineacion === 'justificada' ? styles.lineaJustificada : styles.lineaCentrada}>
      {linea.segmentos.map((segmento, i) => (
        <Text key={i} style={segmento.negrita ? styles.segmentoNegrita : styles.segmento}>
          {segmento.texto}
        </Text>
      ))}
    </Text>
  );
}

export interface ConstanciaEventoTemplateProps {
  contenido: ContenidoConstancia;
}

export function ConstanciaEventoTemplate({ contenido }: ConstanciaEventoTemplateProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.container}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={getBackgroundImage()} style={styles.backgroundImage} />

          <View style={styles.cuerpoBox}>
            {contenido.destinatario ? <Text style={styles.nombre}>{contenido.destinatario}</Text> : null}
            {contenido.cuerpo.map(renderLinea)}
          </View>

          <View style={styles.firmas}>
            {FIRMAS_CONSTANCIA.map((firma) => (
              <View key={firma} style={styles.firmaColumna}>
                <View style={styles.firmaLinea} />
                <Text style={styles.firmaLabel}>{firma}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
}
