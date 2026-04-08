import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Share, Alert, Modal, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useApp } from '../context/AppContext';
import { Card, BigButton, InputField } from '../components/UI';
import { COLORS, SIZES } from '../utils/theme';
import { generateBarcode, formatCurrency } from '../utils/helpers';

// ── Real EAN-13 Barcode Renderer ──────────────────────────────────────────────
// EAN-13 encoding tables
const L_CODE = {
  '0': '0001101', '1': '0011001', '2': '0010011', '3': '0111101', '4': '0100011',
  '5': '0110001', '6': '0101111', '7': '0111011', '8': '0110111', '9': '0001011',
};
const R_CODE = {
  '0': '1110010', '1': '1100110', '2': '1101100', '3': '1000010', '4': '1011100',
  '5': '1001110', '6': '1010000', '7': '1000100', '8': '1001000', '9': '1110100',
};
const G_CODE = {
  '0': '0100111', '1': '0110011', '2': '0011011', '3': '0100001', '4': '0011101',
  '5': '0111001', '6': '0000101', '7': '0010001', '8': '0001001', '9': '0010111',
};
// First digit parity pattern
const PARITY = [
  'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
  'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL',
];

function encodeEAN13(barcode) {
  const digits = barcode.padEnd(13, '0').slice(0, 13);
  const first = parseInt(digits[0]);
  const parity = PARITY[first] || 'LLLLLL';
  let bits = '101'; // start guard
  for (let i = 1; i <= 6; i++) {
    const d = digits[i];
    const p = parity[i - 1];
    bits += p === 'L' ? L_CODE[d] : G_CODE[d];
  }
  bits += '01010'; // middle guard
  for (let i = 7; i <= 12; i++) {
    bits += R_CODE[digits[i]];
  }
  bits += '101'; // end guard
  return { bits, digits };
}

export function EAN13Barcode({ barcode, productName, storeName, width = 300, showLabels = true }) {
  const { bits, digits } = encodeEAN13(barcode || '0000000000000');
  const height = 100;
  const barW = (width - 20) / bits.length;
  const barsX = 10;
  const topY = showLabels ? 36 : 8;
  const textY = topY + height + 14;
  const totalH = showLabels ? topY + height + (storeName ? 56 : 30) : height + 28;

  const bars = [];
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === '1') {
      // Guard bars (start/end/middle) are taller
      const isGuard = i < 3 || i > bits.length - 4 || (i >= 45 && i <= 49);
      bars.push(
        <Rect
          key={i}
          x={barsX + i * barW}
          y={topY}
          width={Math.max(barW, 0.8)}
          height={isGuard ? height + 6 : height}
          fill="#000"
        />
      );
    }
  }

  return (
    <Svg width={width} height={totalH}>
      {/* Product name at top */}
      {showLabels && productName && (
        <SvgText
          x={width / 2} y={20}
          textAnchor="middle"
          fontSize="13"
          fontWeight="bold"
          fill="#000"
        >
          {productName.length > 30 ? productName.slice(0, 28) + '…' : productName}
        </SvgText>
      )}

      {/* Bars */}
      {bars}

      {/* EAN number below bars: first digit, left 6, right 6 */}
      {showLabels && (
        <>
          <SvgText x={barsX - 2} y={textY} textAnchor="end" fontSize="10" fill="#000">{digits[0]}</SvgText>
          <SvgText x={barsX + 3 * barW + 2} y={textY} textAnchor="start" fontSize="10" fill="#000">{digits.slice(1, 7)}</SvgText>
          <SvgText x={barsX + 50 * barW + 2} y={textY} textAnchor="start" fontSize="10" fill="#000">{digits.slice(7, 13)}</SvgText>
        </>
      )}

      {/* Store name at bottom */}
      {showLabels && storeName && (
        <SvgText
          x={width / 2} y={textY + 28}
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill="#000"
        >
          {storeName}
        </SvgText>
      )}
    </Svg>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function BarcodeGeneratorScreen({ navigation, route }) {
  const { products } = useApp();
  const [selectedProduct, setSelectedProduct] = useState(route?.params?.product || null);
  const [customBarcode, setCustomBarcode] = useState('');
  const [mode, setMode] = useState(route?.params?.product ? 'product' : 'product');
  const [search, setSearch] = useState('');
  const [pickModal, setPickModal] = useState(false);
  const [printing, setPrinting] = useState(false);
  const storeName = 'Asha Cycle Store';

  const activeBarcode = mode === 'product' ? selectedProduct?.barcode : (customBarcode || '');
  const activeProductName = mode === 'product' ? selectedProduct?.name : '';

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search)
  );

  // Generate printable HTML with real barcode look
  const generatePrintHTML = () => {
    const { bits, digits } = encodeEAN13(activeBarcode || '0000000000000');
    const barW = 2.2;
    const barsHTML = [...bits].map((b, i) => {
      if (b !== '1') return '';
      const isGuard = i < 3 || i > bits.length - 4 || (i >= 45 && i <= 49);
      return `<div style="position:absolute;left:${i * barW}px;top:0;width:${barW}px;height:${isGuard ? 76 : 68}px;background:#000;"></div>`;
    }).join('');

    const leftDigits = digits.slice(1, 7);
    const rightDigits = digits.slice(7, 13);
    const totalBarsW = bits.length * barW;

    return `
      <!DOCTYPE html><html>
      <head><meta charset="UTF-8"/>
      <style>
        @page { margin: 10mm; }
        body { font-family: 'Courier New', monospace; background: #fff; display: flex; flex-direction: column; align-items: center; padding: 20px; }
        .label { background: #fff; border: 2px solid #ddd; border-radius: 10px; padding: 20px 28px; display: inline-flex; flex-direction: column; align-items: center; min-width: 280px; }
        .product-name { font-size: 15px; font-weight: bold; font-family: Arial, sans-serif; margin-bottom: 14px; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; }
        .barcode-wrap { position: relative; height: 80px; margin-bottom: 4px; }
        .digits { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; font-size: 12px; letter-spacing: 2px; }
        .store-name { font-size: 14px; font-weight: bold; font-family: Arial, sans-serif; text-align: center; text-transform: uppercase; letter-spacing: 1px; }
        .print-btn { display: none; }
      </style>
      </head>
      <body>
        <div class="label">
          ${activeProductName ? `<div class="product-name">${activeProductName}</div>` : ''}
          <div class="barcode-wrap" style="width:${totalBarsW}px">
            ${barsHTML}
          </div>
          <div class="digits">
            <span>${digits[0]}</span>
            <span>${leftDigits}</span>
            <span>${rightDigits}</span>
          </div>
          <div class="store-name">${storeName}</div>
        </div>
        <script>window.onload = () => window.print();</script>
      </body>
      </html>
    `;
  };

  const handlePrint = async () => {
    if (!activeBarcode) { Alert.alert('No Barcode', 'Please select a product or enter a barcode first'); return; }
    setPrinting(true);
    try {
      await Print.printAsync({ html: generatePrintHTML() });
    } catch (e) {
      Alert.alert('Print Error', 'Could not open print dialog');
    }
    setPrinting(false);
  };

  const handleSharePDF = async () => {
    if (!activeBarcode) { Alert.alert('No Barcode', 'Select a product first'); return; }
    try {
      const { uri } = await Print.printToFileAsync({ html: generatePrintHTML() });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share Barcode PDF' });
    } catch (e) {
      Alert.alert('Error', 'Could not generate PDF');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4a148c', '#6a1b9a', '#7b1fa2']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Barcode Generator</Text>
          <View style={{ width: 26 }} />
        </View>
        <View style={styles.modeRow}>
          <TouchableOpacity onPress={() => setMode('product')} style={[styles.modeBtn, mode === 'product' && styles.modeBtnActive]}>
            <Text style={[styles.modeBtnText, mode === 'product' && styles.modeBtnTextActive]}>From Product</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMode('custom')} style={[styles.modeBtn, mode === 'custom' && styles.modeBtnActive]}>
            <Text style={[styles.modeBtnText, mode === 'custom' && styles.modeBtnTextActive]}>Custom Code</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body}>
        {/* ── Barcode Preview Card ── */}
        <Card style={styles.previewCard}>
          <Text style={styles.previewLabel}>📦 Barcode Preview</Text>
          {activeBarcode ? (
            <View style={styles.barcodeWrapper}>
              <View style={styles.barcodeLabel}>
                <EAN13Barcode
                  barcode={activeBarcode}
                  productName={activeProductName}
                  storeName={storeName}
                  width={280}
                />
              </View>
            </View>
          ) : (
            <View style={styles.emptyBarcode}>
              <Ionicons name="barcode-outline" size={72} color={COLORS.border} />
              <Text style={styles.emptyText}>
                {mode === 'product' ? 'Select a product below' : 'Enter a barcode number below'}
              </Text>
            </View>
          )}

          {activeBarcode && (
            <View style={styles.barcodeActions}>
              <TouchableOpacity onPress={handlePrint} style={[styles.actionBtn, { backgroundColor: COLORS.primary + '12', borderColor: COLORS.primary + '30' }]} disabled={printing}>
                <Ionicons name="print-outline" size={22} color={COLORS.primary} />
                <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>{printing ? 'Opening...' : 'Print'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSharePDF} style={[styles.actionBtn, { backgroundColor: '#7b1fa2' + '12', borderColor: '#7b1fa2' + '30' }]}>
                <Ionicons name="share-outline" size={22} color="#7b1fa2" />
                <Text style={[styles.actionBtnText, { color: '#7b1fa2' }]}>Share PDF</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* ── Mode Content ── */}
        {mode === 'custom' ? (
          <Card>
            <Text style={styles.cardTitle}>Enter Custom Barcode</Text>
            <InputField
              icon="barcode-outline"
              placeholder="Enter 13-digit number..."
              value={customBarcode}
              onChangeText={setCustomBarcode}
              keyboardType="number-pad"
              maxLength={13}
            />
            <BigButton
              title="Generate Random Barcode"
              icon="shuffle-outline"
              variant="outline"
              onPress={() => setCustomBarcode(generateBarcode())}
            />
          </Card>
        ) : (
          <Card>
            <View style={styles.selectHeader}>
              <Text style={styles.cardTitle}>Select Product</Text>
              <TouchableOpacity onPress={() => setPickModal(true)} style={styles.browseBtn}>
                <Text style={styles.browseBtnText}>Browse All</Text>
              </TouchableOpacity>
            </View>
            <InputField
              icon="search-outline"
              placeholder="Search products..."
              value={search}
              onChangeText={setSearch}
            />
            {filteredProducts.slice(0, 6).map(p => (
              <TouchableOpacity key={p.id} onPress={() => { setSelectedProduct(p); setSearch(''); }}
                style={[styles.productRow, selectedProduct?.id === p.id && styles.productRowActive]}>
                <Ionicons
                  name={selectedProduct?.id === p.id ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22} color={selectedProduct?.id === p.id ? COLORS.primary : COLORS.border}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{p.name}</Text>
                  <Text style={styles.productBarcode}>{p.barcode}</Text>
                </View>
                <Text style={styles.productPrice}>{formatCurrency(p.normalPrice)}</Text>
              </TouchableOpacity>
            ))}
            {filteredProducts.length === 0 && (
              <Text style={styles.noResults}>No products found</Text>
            )}
          </Card>
        )}

        {/* ── Print Instructions ── */}
        <Card style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>📋 How to Print</Text>
          <Text style={styles.instructionText}>1. Select a product or enter a barcode above</Text>
          <Text style={styles.instructionText}>2. Tap <Text style={{ fontWeight: '700' }}>Print</Text> to send directly to a printer</Text>
          <Text style={styles.instructionText}>3. Or tap <Text style={{ fontWeight: '700' }}>Share PDF</Text> to save or share the barcode file</Text>
          <Text style={styles.instructionText}>4. Print on label paper for best results</Text>
        </Card>
      </ScrollView>

      {/* Browse All Modal */}
      <Modal visible={pickModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: COLORS.white }}>
          <LinearGradient colors={['#4a148c', '#6a1b9a']} style={styles.pickHeader}>
            <TouchableOpacity onPress={() => setPickModal(false)}>
              <Ionicons name="close" size={28} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.pickTitle}>Select Product</Text>
            <View style={{ width: 28 }} />
          </LinearGradient>
          <FlatList
            data={products}
            keyExtractor={p => p.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item: p }) => (
              <TouchableOpacity onPress={() => { setSelectedProduct(p); setMode('product'); setPickModal(false); }}
                style={[styles.productRow, selectedProduct?.id === p.id && styles.productRowActive, { marginBottom: 8 }]}>
                <Ionicons name={selectedProduct?.id === p.id ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24} color={selectedProduct?.id === p.id ? COLORS.primary : COLORS.border} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{p.name}</Text>
                  <Text style={styles.productBarcode}>{p.barcode}</Text>
                </View>
                <Text style={styles.productPrice}>{formatCurrency(p.normalPrice)}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerTitle: { fontSize: SIZES.h3, fontWeight: '800', color: COLORS.white },
  modeRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 30, padding: 4 },
  modeBtn: { flex: 1, paddingVertical: 8, borderRadius: 26, alignItems: 'center' },
  modeBtnActive: { backgroundColor: COLORS.white },
  modeBtnText: { fontSize: SIZES.small, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  modeBtnTextActive: { color: '#6a1b9a', fontWeight: '700' },
  body: { padding: 16, paddingBottom: 60 },
  previewCard: { alignItems: 'center', marginBottom: 16 },
  previewLabel: { fontSize: SIZES.small, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, alignSelf: 'flex-start', marginBottom: 16 },
  barcodeWrapper: { alignItems: 'center', width: '100%' },
  barcodeLabel: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#ddd',
    padding: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  emptyBarcode: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: SIZES.body, color: COLORS.textLight, marginTop: 14, textAlign: 'center' },
  barcodeActions: { flexDirection: 'row', gap: 12, marginTop: 20, width: '100%' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderRadius: 14, paddingVertical: 13 },
  actionBtnText: { fontSize: SIZES.body, fontWeight: '700' },
  cardTitle: { fontSize: SIZES.h4, fontWeight: '800', color: COLORS.text, marginBottom: 14 },
  selectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  browseBtn: { backgroundColor: COLORS.primary + '12', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  browseBtnText: { fontSize: SIZES.small, fontWeight: '700', color: COLORS.primary },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  productRowActive: { backgroundColor: COLORS.primary + '08', borderRadius: 10, paddingHorizontal: 8, borderBottomWidth: 0 },
  productName: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.text },
  productBarcode: { fontSize: SIZES.tiny, color: COLORS.textSecondary, fontFamily: 'monospace', marginTop: 2 },
  productPrice: { fontSize: SIZES.body, fontWeight: '800', color: COLORS.success },
  noResults: { textAlign: 'center', color: COLORS.textLight, paddingVertical: 20, fontSize: SIZES.body },
  instructionCard: { backgroundColor: '#e8f4fd', borderColor: COLORS.primary + '30', borderWidth: 1 },
  instructionTitle: { fontSize: SIZES.body, fontWeight: '800', color: COLORS.primary, marginBottom: 10 },
  instructionText: { fontSize: SIZES.small, color: COLORS.textSecondary, marginBottom: 6, lineHeight: 22 },
  pickHeader: { paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickTitle: { fontSize: SIZES.h3, fontWeight: '800', color: COLORS.white },
});
