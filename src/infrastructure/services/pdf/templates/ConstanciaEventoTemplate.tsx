import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { ContenidoConstancia, LineaConstancia } from '@/application/dtos/ConstanciaDTO';

Font.registerHyphenationCallback((palabra) => [palabra]);

// Medidas exactas de public/congreso_Reconocimiento2026_oficial_plantilla.pdf
export const CONSTANCIA_PAGE_WIDTH = 841.91254;
export const CONSTANCIA_PAGE_HEIGHT = 595.31921;

const NEGRO = '#000000';

// Banda lavanda del fondo oficial (medida sobre la plantilla):
// y top-down 261.5..309.0 pt (centro 285.2), x 152.5..667.5 (centro 410.0)
const BANDA_CENTRO_Y = 285.2;
const BANDA_CENTRO_X = 410;
const BANDA_ANCHO = 515;
const NOMBRE_LARGO_1_LINEA = 46;
const NOMBRE_LARGO_2_LINEAS = 95;
// compensación de métricas (la tinta queda ~2 pt sobre el centro de la línea)
const NOMBRE_AJUSTE_TINTA = 2;
const NOMBRE_MULTILINEA_TOP = 318; // 3+ líneas: debajo de la banda (309) con aire

interface DisposicionNombre {
  top: number;
  tamanio: number;
  interlineado: number;
  margenInferior: number;
}

function disposicionNombre(nombre: string): DisposicionNombre {
  const largo = nombre.length;
  if (largo <= NOMBRE_LARGO_1_LINEA) {
    // una línea centrada en la banda: caja de 31.2pt centrada en 285.2
    return { top: BANDA_CENTRO_Y - 15.6 + NOMBRE_AJUSTE_TINTA, tamanio: 24, interlineado: 31.2, margenInferior: 26 };
  }
  if (largo <= NOMBRE_LARGO_2_LINEAS) {
    // dos líneas (25pt c/u) centradas en bloque sobre la banda
    return { top: BANDA_CENTRO_Y - 25.3, tamanio: 20, interlineado: 25, margenInferior: 22 };
  }
  return { top: NOMBRE_MULTILINEA_TOP, tamanio: 18, interlineado: 23.4, margenInferior: 20 };
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
  },
  // Zona del fondo oficial destinada al destinatario y el texto.
  cuerpoBox: {
    position: 'absolute',
    left: BANDA_CENTRO_X - BANDA_ANCHO / 2,
    right: CONSTANCIA_PAGE_WIDTH - (BANDA_CENTRO_X + BANDA_ANCHO / 2),
  },
  nombreBase: {
    fontFamily: 'Helvetica-Bold',
    color: NEGRO,
    textAlign: 'center',
  },
  lineaCentrada: {
    fontSize: 15,
    color: NEGRO,
    textAlign: 'center',
    lineHeight: 1.35,
    marginBottom: 10,
  },
  lineaJustificada: {
    fontSize: 15,
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
  const disposicion = disposicionNombre(contenido.destinatario ?? '');
  return (
    <Document>
      <Page size={[CONSTANCIA_PAGE_WIDTH, CONSTANCIA_PAGE_HEIGHT]} style={styles.page}>
        <View style={[styles.cuerpoBox, { top: disposicion.top }]}>
          {contenido.destinatario ? (
            <Text
              style={[
                styles.nombreBase,
                {
                  fontSize: disposicion.tamanio,
                  lineHeight: disposicion.interlineado / disposicion.tamanio,
                  marginBottom: disposicion.margenInferior,
                },
              ]}
            >
              {contenido.destinatario}
            </Text>
          ) : null}
          {contenido.cuerpo.map(renderLinea)}
        </View>
      </Page>
    </Document>
  );
}
