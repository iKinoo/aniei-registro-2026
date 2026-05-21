import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Rect,
  Line,
} from '@react-pdf/renderer';

// ─── Paleta ──────────────────────────────────────────────────────────────────
const BLUE_DARK  = "#1a3a5c";
const BLUE_MID   = "#1e6fa8";
const BLUE_LIGHT = "#e8f1f8";
const GRAY_TEXT  = "#4a4a4a";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#fff",
    fontFamily: "Helvetica",
    position: "relative",
  },

  content: {
    paddingHorizontal: 60,
    paddingTop: 30,
    paddingBottom: 40,
    height: "100%",
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 40,
  },
  headerLeft: {
    flexDirection: "row",
    width: 520,
  },
  xxxv: {
    fontSize: 36,
    fontFamily: "Helvetica-Bold",
    color: BLUE_DARK,
    marginRight: 14,
  },
  headerDivider: {
    width: 2,
    height: 56,
    backgroundColor: BLUE_MID,
    marginRight: 12,
  },
  headerText: {
    width: 300,
  },
  headerTitle: {
    fontSize: 11,
    color: BLUE_DARK,
    lineHeight: 1.4,
  },
  headerTitleBold: {
    fontFamily: "Helvetica-Bold",
  },
  headerLogos: {
    flexDirection: "row",
    alignItems: "center",
  },

  // ── Cuerpo ──────────────────────────────────────────────────────────────
  body: {
    alignItems: "center",
    marginTop: 20,
  },
  orgLine1: {
    fontSize: 9,
    color: BLUE_DARK,
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  orgLine2: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: BLUE_DARK,
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  otorgaText: {
    fontSize: 9,
    color: GRAY_TEXT,
    textAlign: "center",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  reconocimientoText: {
    fontSize: 42,
    lineHeight: 1,
    color: BLUE_DARK,
    textAlign: "center",
    marginBottom: 18,
  },
  nameBox: {
    backgroundColor: BLUE_LIGHT,
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 50,
    marginBottom: 20,
    minWidth: 340,
    alignItems: "center",
  },
  nameText: {
    fontSize: 32,
    color: BLUE_DARK,
    textAlign: "center",
  },
  descriptionText: {
    fontSize: 11,
    color: GRAY_TEXT,
    textAlign: "center",
    lineHeight: 1.6,
    marginBottom: 10,
    width: 560,
  },

  // ── Footer ──────────────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  locationText: {
    fontSize: 10,
    color: GRAY_TEXT,
    textAlign: "center",
    marginBottom: 24,
  },
  signaturesRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signatureBlock: {
    alignItems: "center",
    width: 160,
    marginHorizontal: 40,
  },
  signatureLine: {
    borderBottomWidth: 1.2,
    borderBottomColor: BLUE_DARK,
    width: 140,
    marginBottom: 4,
  },
  signatureName: {
    fontSize: 9,
    color: BLUE_DARK,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
  },
  signatureCargo: {
    fontSize: 9,
    color: GRAY_TEXT,
    textAlign: "center",
  },
});

// ─── Decoraciones geométricas (SVG) ──────────────────────────────────────────
const DecoTopLeft = () => (
  <View style={{ position: "absolute", top: 0, left: 0, width: 120, height: 110 }}>
    <Svg width={120} height={110}>
      <Path d="M0,0 L90,0 L0,90 Z" fill={BLUE_DARK} />
      <Path d="M20,0 L90,0 L20,60 Z" fill={BLUE_MID} opacity="0.7" />
      {[10, 20, 30, 40].map((offset, i) => (
        <Line
          key={i}
          x1={offset} y1={0}
          x2={0} y2={offset}
          stroke="#ffffff"
          strokeWidth={0.8}
          opacity={0.3}
        />
      ))}
    </Svg>
  </View>
);

const DecoBottomRight = () => (
  <View style={{ position: "absolute", bottom: 0, right: 0, width: 130, height: 140 }}>
    <Svg width={130} height={140}>
      {[0, 10, 20, 30, 40, 50].map((y, i) => (
        <Rect
          key={i}
          x={60} y={140 - 60 + y}
          width={70} height={6}
          fill={BLUE_DARK}
          opacity={1 - i * 0.12}
        />
      ))}
      <Path
        d="M40,20 L90,70 L40,120"
        stroke={BLUE_MID}
        strokeWidth={18}
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M55,35 L90,70 L55,105"
        stroke={BLUE_DARK}
        strokeWidth={14}
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

const LogoPlaceholder = ({ label, width = 60, height = 40 }: { label: string; width?: number; height?: number }) => (
  <View
    style={{
      width,
      height,
      borderWidth: 1,
      borderColor: "#cccccc",
      borderRadius: 3,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f5f5f5",
    }}
  >
    <Text style={{ fontSize: 6, color: "#888", textAlign: "center" }}>{label}</Text>
  </View>
);

// ─── Firmas fijas ────────────────────────────────────────────────────────────
const DEFAULT_SIGNERS = [
  { name: "Ing. Juan Gutierrez", cargo: "Cargo" },
  { name: "Ing. Juan Gutierrez", cargo: "Cargo" },
];

// ─── Props ───────────────────────────────────────────────────────────────────
export interface GenericConstanciaTemplateProps {
  documentTitle: string;
  recipientName: string;
  description: string;
  location: string;
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function GenericConstanciaTemplate({
  documentTitle = "RECONOCIMIENTO",
  recipientName = "Fulano de tal",
  description = "",
  location = "Cabo San Lucas, BCS. 10 al 12 de Junio del 2026",
}: GenericConstanciaTemplateProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <DecoTopLeft />
        <DecoBottomRight />

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.xxxv}>XXXV</Text>
              <View style={styles.headerDivider} />
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>
                  REUNIÓN <Text style={styles.headerTitleBold}>NACIONAL</Text>{"\n"}
                  DE DIRECTIVOS Y LIDEREZ ESTRATÉGICOS{"\n"}
                  Y ACADÉMICOS EN TECNOLOGÍAS DE{"\n"}
                  LA INFORMACIÓN -RDN ANIEI 2026
                </Text>
              </View>
            </View>
            <View style={styles.headerLogos}>
              <LogoPlaceholder label="ANIEI" width={65} height={42} />
              <View style={{ width: 8 }} />
              <LogoPlaceholder label="LICEO\nUNIV." width={55} height={42} />
            </View>
          </View>

          {/* Cuerpo */}
          <View style={styles.body}>
            <Text style={styles.orgLine1}>
              LA ASOCIACIÓN NACIONAL DE INSTITUCIONES DE EDUCACIÓN
            </Text>
            <Text style={styles.orgLine2}>
              EN TECNOLOGÍAS DE LA INFORMACIÓN{" "}
              <Text style={{ fontFamily: "Helvetica" }}>ANIEI</Text>
            </Text>
            <Text style={styles.otorgaText}>OTORGA EL PRESENTE</Text>
            <Text style={styles.reconocimientoText}>{documentTitle}</Text>

            <View style={styles.nameBox}>
              <Text style={styles.nameText}>A: {recipientName}</Text>
            </View>

            <Text style={styles.descriptionText}>{description}</Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.locationText}>{location}</Text>
            <View style={styles.signaturesRow}>
              {DEFAULT_SIGNERS.map((s, i) => (
                <View key={i} style={styles.signatureBlock}>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signatureName}>{s.name}</Text>
                  <Text style={styles.signatureCargo}>{s.cargo}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
