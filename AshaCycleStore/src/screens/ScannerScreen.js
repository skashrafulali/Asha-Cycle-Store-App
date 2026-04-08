import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { Card, BigButton, Badge } from '../components/UI';
import { COLORS, SIZES } from '../utils/theme';
import { formatCurrency } from '../utils/helpers';

export default function ScannerScreen({ navigation }) {
  const { getProductByBarcode, currentUser } = useApp();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [foundProduct, setFoundProduct] = useState(null);
  const [torch, setTorch] = useState(false);
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    setScanned(true);
    const product = getProductByBarcode(data);
    if (product) {
      setFoundProduct(product);
    } else {
      Alert.alert(
        'Product Not Found',
        `Barcode: ${data}\n\nNo product matches this barcode.`,
        [
          { text: 'Scan Again', onPress: () => setScanned(false) },
          isAdmin ? { text: 'Add Product', onPress: () => { setScanned(false); navigation.navigate('Inventory'); } } : null,
        ].filter(Boolean)
      );
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permCenter}>
        <Ionicons name="camera-outline" size={64} color={COLORS.textLight} />
        <Text style={styles.permText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permCenter}>
        <Ionicons name="camera-off-outline" size={64} color={COLORS.danger} />
        <Text style={styles.permTitle}>Camera Access Required</Text>
        <Text style={styles.permText}>Please allow camera access to scan barcodes.</Text>
        <BigButton title="Go Back" variant="outline" onPress={() => navigation.goBack()} style={{ marginTop: 24, paddingHorizontal: 40 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'code128', 'code39', 'qr', 'upc_a', 'upc_e'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        enableTorch={torch}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Top Bar */}
        <LinearGradient colors={['rgba(0,0,0,0.7)', 'transparent']} style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={26} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Scan Barcode</Text>
          <TouchableOpacity onPress={() => setTorch(!torch)} style={styles.iconBtn}>
            <Ionicons name={torch ? 'flash' : 'flash-outline'} size={24} color={torch ? COLORS.accent : COLORS.white} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Scanner Frame */}
        <View style={styles.frameWrapper}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            <View style={styles.scanLine} />
          </View>
          <Text style={styles.frameHint}>Point at a barcode to scan</Text>
        </View>

        {/* Bottom Bar */}
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.bottomBar}>
          {scanned && (
            <TouchableOpacity onPress={() => { setScanned(false); setFoundProduct(null); }} style={styles.scanAgainBtn}>
              <Ionicons name="refresh-outline" size={22} color={COLORS.white} />
              <Text style={styles.scanAgainText}>Tap to Scan Again</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>

      {/* Product Found Modal */}
      <Modal visible={!!foundProduct} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.productSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Ionicons name="checkmark-circle" size={32} color={COLORS.success} />
              <Text style={styles.sheetTitle}>Product Found!</Text>
            </View>

            {foundProduct && (
              <>
                <Text style={styles.productName}>{foundProduct.name}</Text>
                <Badge label={foundProduct.category} color={COLORS.primary} />

                <View style={styles.detailsGrid}>
                  <DetailItem label="Barcode" value={foundProduct.barcode} />
                  <DetailItem label="Selling Price" value={formatCurrency(foundProduct.sellingPrice)} highlight />
                  {isAdmin && <DetailItem label="Buying Price" value={formatCurrency(foundProduct.buyingPrice)} />}
                  <DetailItem
                    label="In Stock"
                    value={`${foundProduct.stock} ${foundProduct.unit}`}
                    highlight={foundProduct.stock <= foundProduct.lowStockAlert}
                    highlightColor={COLORS.danger}
                  />
                </View>

                <View style={styles.sheetActions}>
                  <BigButton
                    title="Scan Again"
                    variant="outline"
                    icon="refresh-outline"
                    onPress={() => { setFoundProduct(null); setScanned(false); }}
                    style={{ flex: 1 }}
                  />
                  <BigButton
                    title="New Sale"
                    icon="cart-outline"
                    onPress={() => { setFoundProduct(null); navigation.navigate('NewSale'); }}
                    style={{ flex: 1 }}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DetailItem({ label, value, highlight, highlightColor }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, highlight && { color: highlightColor || COLORS.success }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: COLORS.background },
  permTitle: { fontSize: SIZES.h3, fontWeight: '800', color: COLORS.text, marginTop: 16, marginBottom: 8 },
  permText: { fontSize: SIZES.body, color: COLORS.textSecondary, textAlign: 'center' },
  overlay: { flex: 1 },
  topBar: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topTitle: { fontSize: SIZES.h4, fontWeight: '800', color: COLORS.white },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  frameWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: { width: 260, height: 180, position: 'relative' },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: COLORS.accent, borderWidth: 4 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanLine: {
    position: 'absolute', top: '50%', left: 10, right: 10, height: 2,
    backgroundColor: COLORS.accent, opacity: 0.8,
  },
  frameHint: { color: 'rgba(255,255,255,0.7)', marginTop: 20, fontSize: SIZES.body, textAlign: 'center' },
  bottomBar: { paddingBottom: 50, paddingTop: 20, alignItems: 'center' },
  scanAgainBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30 },
  scanAgainText: { color: COLORS.white, fontWeight: '700', fontSize: SIZES.body },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  productSheet: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40,
  },
  sheetHandle: { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  sheetTitle: { fontSize: SIZES.h3, fontWeight: '800', color: COLORS.text },
  productName: { fontSize: SIZES.h3, fontWeight: '900', color: COLORS.text, marginBottom: 8 },
  detailsGrid: { marginTop: 16 },
  detailItem: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  detailLabel: { fontSize: SIZES.body, color: COLORS.textSecondary },
  detailValue: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.text },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
});
