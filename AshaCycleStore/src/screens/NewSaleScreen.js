import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { BigButton, Card } from '../components/UI';
import { COLORS, SIZES } from '../utils/theme';
import { formatCurrency } from '../utils/helpers';

export default function NewSaleScreen({ navigation }) {
  const { products, createSale } = useApp();
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [priceType, setPriceType] = useState('normal'); // 'normal' | 'paikari'
  const [customerName, setCustomerName] = useState('');
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  const filteredProducts = useMemo(() => {
    const s = search.toLowerCase();
    return products.filter(p =>
      (p.name.toLowerCase().includes(s) || p.barcode.includes(s)) && p.stock > 0
    );
  }, [products, search]);

  const getPrice = (p) => priceType === 'paikari' ? p.paikariPrice : p.normalPrice;
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = (product) => {
    const price = getPrice(product);
    const existing = cart.find(i => i.productId === product.id);
    if (existing) {
      if (existing.qty >= product.stock) { Alert.alert('Stock Limit', `Only ${product.stock} in stock`); return; }
      setCart(cart.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1, price } : i));
    } else {
      setCart([...cart, {
        productId: product.id, name: product.name, price,
        buyingPrice: product.buyingPrice, qty: 1, unit: product.unit, maxStock: product.stock,
      }]);
    }
  };

  const removeFromCart = (id) => setCart(cart.filter(i => i.productId !== id));

  const updateQty = (id, qty) => {
    if (qty <= 0) { removeFromCart(id); return; }
    const item = cart.find(i => i.productId === id);
    if (qty > item.maxStock) { Alert.alert('Stock Limit', `Only ${item.maxStock} available`); return; }
    setCart(cart.map(i => i.productId === id ? { ...i, qty } : i));
  };

  // When price type changes, update prices in cart
  const changePriceType = (type) => {
    setPriceType(type);
    setCart(cart.map(i => {
      const product = products.find(p => p.id === i.productId);
      if (!product) return i;
      return { ...i, price: type === 'paikari' ? product.paikariPrice : product.normalPrice };
    }));
  };

  const confirmSale = () => {
    if (cart.length === 0) { Alert.alert('Empty Cart', 'Add items first'); return; }
    const sale = createSale(cart, customerName || 'Walk-in Customer', priceType);
    Alert.alert(
      '✅ Sale Complete!',
      `${sale.invoiceNo}\nTotal: ${formatCurrency(sale.total)}`,
      [
        { text: 'View Invoice', onPress: () => { setCheckoutModal(false); navigation.navigate('Invoices'); } },
        { text: 'New Sale', onPress: () => { setCart([]); setCheckoutModal(false); setCustomerName(''); } },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.success, '#1b5e20']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Sale</Text>
          <TouchableOpacity onPress={() => setShowGrid(!showGrid)}>
            <Ionicons name={showGrid ? 'list-outline' : 'grid-outline'} size={26} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Price Type Toggle */}
        <View style={styles.priceTypeRow}>
          <Ionicons name="pricetag-outline" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.priceTypeLabel}>Price Type:</Text>
          <TouchableOpacity onPress={() => changePriceType('normal')} style={[styles.ptBtn, priceType === 'normal' && styles.ptBtnActive]}>
            <Text style={[styles.ptBtnText, priceType === 'normal' && styles.ptBtnTextActive]}>Normal</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changePriceType('paikari')} style={[styles.ptBtn, priceType === 'paikari' && styles.ptBtnActive]}>
            <Text style={[styles.ptBtnText, priceType === 'paikari' && styles.ptBtnTextActive]}>Paikari</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
          <TextInput style={styles.searchInput} placeholder="Search products..." placeholderTextColor={COLORS.textLight} value={search} onChangeText={setSearch} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={20} color={COLORS.textSecondary} /></TouchableOpacity> : null}
        </View>
      </LinearGradient>

      {showGrid ? (
        <FlatList
          data={filteredProducts}
          keyExtractor={p => p.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          renderItem={({ item: p }) => {
            const inCart = cart.find(i => i.productId === p.id);
            const price = getPrice(p);
            return (
              <TouchableOpacity onPress={() => addToCart(p)} activeOpacity={0.85} style={styles.tileTouchable}>
                <View style={[styles.tile, inCart && styles.tileActive]}>
                  <Ionicons name="cube" size={28} color={inCart ? COLORS.white : COLORS.primary} />
                  <Text style={[styles.tileName, inCart && styles.tileTextWhite]} numberOfLines={2}>{p.name}</Text>
                  <Text style={[styles.tilePrice, inCart && styles.tileTextWhite]}>{formatCurrency(price)}</Text>
                  <Text style={[styles.tileStock, inCart && { color: 'rgba(255,255,255,0.7)' }]}>
                    {p.stock} {p.unit}
                  </Text>
                  {inCart && (
                    <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{inCart.qty}</Text></View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<View style={{ alignItems: 'center', padding: 48 }}><Ionicons name="cube-outline" size={48} color={COLORS.border} /><Text style={styles.emptyText}>No products found</Text></View>}
        />
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          {cart.length === 0
            ? <View style={{ alignItems: 'center', padding: 60 }}><Ionicons name="cart-outline" size={64} color={COLORS.border} /><Text style={styles.emptyText}>Cart is empty</Text></View>
            : cart.map(item => (
              <Card key={item.productId} style={styles.cartItem}>
                <View style={styles.cartRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cartName}>{item.name}</Text>
                    <Text style={styles.cartPricePer}>{formatCurrency(item.price)} each</Text>
                  </View>
                  <View style={styles.qtyCtrl}>
                    <TouchableOpacity onPress={() => updateQty(item.productId, item.qty - 1)} style={styles.qtyBtn}><Ionicons name="remove" size={18} color={COLORS.primary} /></TouchableOpacity>
                    <Text style={styles.qtyText}>{item.qty}</Text>
                    <TouchableOpacity onPress={() => updateQty(item.productId, item.qty + 1)} style={styles.qtyBtn}><Ionicons name="add" size={18} color={COLORS.primary} /></TouchableOpacity>
                  </View>
                  <Text style={styles.itemTotal}>{formatCurrency(item.price * item.qty)}</Text>
                  <TouchableOpacity onPress={() => removeFromCart(item.productId)} style={{ padding: 4 }}>
                    <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          }
        </ScrollView>
      )}

      {cart.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerTop}>
            <Text style={styles.footerCount}>{cartCount} item(s) · {priceType === 'paikari' ? '🏪 Paikari' : '🛍️ Normal'}</Text>
            <Text style={styles.footerTotal}>{formatCurrency(cartTotal)}</Text>
          </View>
          <BigButton title="Checkout →" icon="checkmark-circle-outline" onPress={() => setCheckoutModal(true)} />
        </View>
      )}

      <Modal visible={checkoutModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.checkoutSheet}>
            <Text style={styles.checkoutTitle}>Confirm Sale</Text>

            <View style={styles.customerRow}>
              <Ionicons name="person-outline" size={22} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.customerInput}
                placeholder="Customer name (optional)"
                value={customerName}
                onChangeText={setCustomerName}
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <View style={styles.ptSummary}>
              <Text style={styles.ptSummaryText}>Price Type: </Text>
              <Text style={[styles.ptSummaryValue, { color: priceType === 'paikari' ? COLORS.primaryLight : COLORS.success }]}>
                {priceType === 'paikari' ? '🏪 Paikari (Wholesale)' : '🛍️ Normal (Retail)'}
              </Text>
            </View>

            <Text style={styles.summaryTitle}>Order Summary</Text>
            {cart.map((item, i) => (
              <View key={i} style={styles.summaryRow}>
                <Text style={styles.summaryName}>{item.name} ×{item.qty}</Text>
                <Text style={styles.summaryPrice}>{formatCurrency(item.price * item.qty)}</Text>
              </View>
            ))}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalVal}>{formatCurrency(cartTotal)}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <BigButton title="Cancel" variant="outline" onPress={() => setCheckoutModal(false)} style={{ flex: 1 }} />
              <BigButton title="Confirm" icon="checkmark-outline" onPress={confirmSale} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerTitle: { fontSize: SIZES.h3, fontWeight: '800', color: COLORS.white },
  priceTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  priceTypeLabel: { fontSize: SIZES.small, color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginRight: 4 },
  ptBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)' },
  ptBtnActive: { backgroundColor: COLORS.white, borderColor: COLORS.white },
  ptBtnText: { fontSize: SIZES.small, color: 'rgba(255,255,255,0.8)', fontWeight: '700' },
  ptBtnTextActive: { color: COLORS.success },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 14, paddingHorizontal: 14, height: 48, gap: 10 },
  searchInput: { flex: 1, fontSize: SIZES.body, color: COLORS.text },
  grid: { padding: 12, paddingBottom: 120 },
  tileTouchable: { flex: 1, margin: 5 },
  tile: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 14, alignItems: 'center',
    borderWidth: 2, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    gap: 6,
  },
  tileActive: { backgroundColor: COLORS.primary, borderColor: COLORS.accent },
  tileName: { fontSize: SIZES.small, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  tilePrice: { fontSize: SIZES.body, fontWeight: '900', color: COLORS.success },
  tileStock: { fontSize: SIZES.tiny, color: COLORS.textSecondary },
  tileTextWhite: { color: COLORS.white },
  cartBadge: { position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: COLORS.white, fontSize: 11, fontWeight: '800' },
  emptyText: { fontSize: SIZES.h4, color: COLORS.textSecondary, marginTop: 12, fontWeight: '700' },
  cartItem: { marginBottom: 8 },
  cartRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartName: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.text },
  cartPricePer: { fontSize: SIZES.small, color: COLORS.textSecondary, marginTop: 2 },
  qtyCtrl: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.background, borderRadius: 10, padding: 6 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary + '15', alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: SIZES.body, fontWeight: '800', color: COLORS.text, minWidth: 24, textAlign: 'center' },
  itemTotal: { fontSize: SIZES.body, fontWeight: '900', color: COLORS.success },
  footer: { backgroundColor: COLORS.white, padding: 20, paddingBottom: 32, borderTopWidth: 1, borderTopColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 8 },
  footerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  footerCount: { fontSize: SIZES.small, color: COLORS.textSecondary, fontWeight: '600' },
  footerTotal: { fontSize: SIZES.h3, fontWeight: '900', color: COLORS.text },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  checkoutSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 40 },
  checkoutTitle: { fontSize: SIZES.h2, fontWeight: '900', color: COLORS.text, marginBottom: 20 },
  customerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 14, paddingHorizontal: 16, height: 52, marginBottom: 12 },
  customerInput: { flex: 1, fontSize: SIZES.body, color: COLORS.text },
  ptSummary: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  ptSummaryText: { fontSize: SIZES.body, color: COLORS.textSecondary },
  ptSummaryValue: { fontSize: SIZES.body, fontWeight: '800' },
  summaryTitle: { fontSize: SIZES.h4, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  summaryName: { fontSize: SIZES.body, color: COLORS.text },
  summaryPrice: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.text },
  totalRow: { borderBottomWidth: 0, marginTop: 4 },
  totalLabel: { fontSize: SIZES.h4, fontWeight: '800', color: COLORS.text },
  totalVal: { fontSize: SIZES.h3, fontWeight: '900', color: COLORS.success },
});
