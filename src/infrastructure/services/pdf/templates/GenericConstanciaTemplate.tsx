import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { readFileSync } from 'fs';
import { join } from 'path';

// ─── Caché de imagen de fondo ────────────────────────────────────────────────
let _bgCache: string | null = null;

function getBackgroundImage(): string {
  if (_bgCache) return _bgCache;
  const bgPath = join(process.cwd(), 'public', 'aniei_reconocimiento_fondo.jpeg');
  const buffer = readFileSync(bgPath);
  _bgCache = `data:image/jpeg;base64,${buffer.toString('base64')}`;
  return _bgCache;
}

// ── Paleta ──────────────────────────────────────────────────────────────────
const BLUE_DARK = "#1a3a5c";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#fff",
    fontFamily: "Helvetica",
  },
  container: {
    position: "relative",
    width: 842,
    height: 595,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 842,
    height: 595,
  },
  nameBox: {
    position: "absolute",
    top: 285,
    left: 280,
    width: 280,
    height: 55,
    backgroundColor: "#fff",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  nameText: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: BLUE_DARK,
    textAlign: "center",
  },
});

// ─── Props ──────────────────────────────────────────────────────────────────
export interface GenericConstanciaTemplateProps {
  documentTitle: string;
  recipientName: string;
  description: string;
  location: string;
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function GenericConstanciaTemplate(props: GenericConstanciaTemplateProps) {
  const { recipientName = "Fulano de tal" } = props;
  const bgImage = getBackgroundImage();

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.container}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={bgImage} style={styles.backgroundImage} />

          <View style={styles.nameBox}>
            <Text style={styles.nameText}>A: {recipientName}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
