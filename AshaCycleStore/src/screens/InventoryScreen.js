import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { BigButton, InputField, Card, Badge, ConfirmModal, EmptyState } from '../components/UI';
import { COLORS, SIZES, CATEGORIES } from '../utils/theme';
import { formatCurrency, generateBarcode } from '../utils/helpers';

export default function InventoryScreen({ navigation }) {
  const { currentUser, products, addProduct, updateProduct, deleteProduct, restockProduct } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [modalType, setModalType] = useState(null);
  const [selected, setSelected] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({});
  const [restockQty, setRestockQty] = useState('');

  const categories = ['All', ...CATEGORIES];

  const filtered = useMemo(() => products.filter(p => {
    const s = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(s) || p.barcode.includes(s) || p.category.toLowerCase().includes(s);
    const matchCat = filterCat === 'All' || p.category === filterCat;
    return matchSearch && matchCat;
  }), [products, search, filterCat]);

  const openAdd = () => {
    setForm({
      name: '', category: CATEGORIES[0], barcode: generateBarcode(),
      buyingPrice: '', secretCode: '', paikariPrice: '', normalPrice: '',
      stock: '', unit: 'pcs', description: '', lowStockAlert: '5',
    });
    setModalType('add');
  };

  const openEdit = (p) => {
    setSelected(p);
    setForm({
      ...p,
      buyingPrice: String(p.buyingPrice || ''),
      paikariPrice: String(p.paikariPrice || ''),
      normalPrice: String(p.normalPrice || ''),
      stock: String(p.stock || ''),
      lowStockAlert: String(p.lowStockAlert || '5'),
    });
    setModalType('edit');
  };

  const handleSave = () => {
    if (!form.name?.trim()) { Alert.alert('Error', 'Product name is required'); return; }
    if (!form.normalPrice) { Alert.alert('Error', 'Normal price is required'); return; }
    if (!form.secretCode?.trim()) { Alert.alert('Error', 'Secret code for buying price is required'); return; }
    const payload = {
      ...form,
      buyingPrice: parseFloat(form.buyingPrice) || 0,
      paikariPrice: parseFloat(form.paikariPrice) || 0,
      normalPrice: parseFloat(form.normalPrice) || 0,
      stock: parseInt(form.stock) || 0,
      lowStockAlert: parseInt(form.lowStockAlert) || 5,
    };
    if (modalType === 'add') addProduct(payload);
    else updateProduct(selected.id, payload);
    setModalType(null);
  };

  const handleRestock = () => {
    const qty = parseInt(restockQty);
    if (!qty || qty <= 0) { Alert.alert('Error', 'Enter a valid quantity'); return; }
    restockProduct(selected.id, qty);
    setModalType(null);
  };

  const renderProduct = ({ item: p }) => (
    <TouchableOpacity onPress={() => { setSelected(p); setModalType('view'); }} activeOpacity={0.8}>
      <Card style={[styles.productCard, p.stock <= p.lowStockAlert && styles.lowStockCard]}>
        <View style={styles.productTop}>
          <View style={styles.productIcon}>
            <Ionicons name="cube" size={22} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.productName}>{p.name}</Text>
            <Text style={styles.productMeta}>{p.category} · {p.barcode.slice(-8)}</Text>
          </View>
          <View style={styles.stockBox}>
            <Text style={[styles.stockNum, p.stock <= p.lowStockAlert && { color: COLORS.danger }]}>{p.stock}</Text>
            <Text style={styles.stockUnit}>{p.unit}</Text>
          </View>
        </View>

        {/* 3-tier price row */}
        <View style={styles.priceRow}>
          {isAdmin ? (
            <PriceChip label="Cost" value={formatCurrency(p.buyingPrice)} color="#7b1fa2" />
          ) : (
            <PriceChip label="Code" value={p.secretCode} color="#7b1fa2" isCode />
          )}
          <PriceChip label="Paikari" value={formatCurrency(p.paikariPrice)} color={COLORS.primaryLight} />
          <PriceChip label="Normal" value={formatCurrency(p.normalPrice)} color={COLORS.success} />
        </View>

        {isAdmin && (
          <View style={styles.actionRow}>
            <ActionBtn icon="refresh-outline" label="Restock" color={COLORS.success} onPress={() => { setSelected(p); setRestockQty(''); setModalType('restock'); }} />
            <ActionBtn icon="create-outline" label="Edit" color={COLORS.primary} onPress={() => openEdit(p)} />
            <ActionBtn icon="barcode-outline" label="Barcode" color="#7b1fa2" onPress={() => navigation.navigate('BarcodeGen', { product: p })} />
            <ActionBtn icon="trash-outline" label="Delete" color={COLORS.danger} onPress={() => setDeleteConfirm(p)} />
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Inventory</Text>
          {isAdmin ? (
            <TouchableOpacity onPress={openAdd} style={styles.addBtn}>
              <Ionicons name="add" size={26} color={COLORS.white} />
            </TouchableOpacity>
          ) : <View style={{ width: 40 }} />}
        </View>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
          <TextInput style={styles.searchInput} placeholder="Search name, barcode, category..." placeholderTextColor={COLORS.textLight} value={search} onChangeText={setSearch} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={20} color={COLORS.textSecondary} /></TouchableOpacity> : null}
        </View>
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
        {categories.map(cat => (
          <TouchableOpacity key={cat} onPress={() => setFilterCat(cat)} style={[styles.catChip, filterCat === cat && styles.catChipActive]}>
            <Text style={[styles.catChipText, filterCat === cat && styles.catChipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.resultCount}>{filtered.length} product(s)</Text>

      <FlatList
        data={filtered}
        keyExtractor={p => p.id}
        renderItem={renderProduct}
        contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 120 }}
        ListEmptyComponent={<EmptyState icon="cube-outline" title="No products found" subtitle="Try different search or add a new product" />}
      />

      {/* ── Add/Edit Modal ── */}
      <Modal visible={['add', 'edit'].includes(modalType)} animationType="slide">
        <ScrollView style={{ flex: 1, backgroundColor: COLORS.white }} keyboardShouldPersistTaps="handled">
          <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.modalHeaderGrad}>
            <TouchableOpacity onPress={() => setModalType(null)}>
              <Ionicons name="close" size={28} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>{modalType === 'add' ? '➕ Add Product' : '✏️ Edit Product'}</Text>
            <View style={{ width: 28 }} />
          </LinearGradient>

          <View style={{ padding: 20 }}>
            <InputField label="Product Name *" placeholder="e.g. Bicycle Chain" value={form.name} onChangeText={v => setForm({ ...form, name: v })} />
            <InputField label="Barcode" icon="barcode-outline" placeholder="Auto-generated" value={form.barcode} onChangeText={v => setForm({ ...form, barcode: v })} />

            <Text style={styles.sectionLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity key={cat} onPress={() => setForm({ ...form, category: cat })} style={[styles.catChip, form.category === cat && styles.catChipActive]}>
                    <Text style={[styles.catChipText, form.category === cat && styles.catChipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* 3-Tier Price Section */}
            <View style={styles.priceSectionBox}>
              <Text style={styles.priceSectionTitle}>💰 Price Tiers</Text>

              <View style={styles.priceFieldRow}>
                <View style={{ flex: 1 }}>
                  <InputField
                    label="🔒 Buying Price (৳) — Admin Only"
                    icon="trending-down-outline"
                    placeholder="Real cost"
                    value={form.buyingPrice}
                    onChangeText={v => setForm({ ...form, buyingPrice: v })}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={[styles.secretBox]}>
                <Ionicons name="eye-off-outline" size={20} color="#7b1fa2" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.secretLabel}>Secret Code for Staff</Text>
                  <Text style={styles.secretHint}>Staff will see this code instead of the buying price</Text>
                  <TextInput
                    style={styles.secretInput}
                    placeholder="e.g. BC-A1 or XYZ99"
                    value={form.secretCode}
                    onChangeText={v => setForm({ ...form, secretCode: v })}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              <InputField
                label="🏪 Paikari Price (৳) — Wholesale"
                icon="people-outline"
                placeholder="Wholesale/resell price"
                value={form.paikariPrice}
                onChangeText={v => setForm({ ...form, paikariPrice: v })}
                keyboardType="decimal-pad"
              />

              <InputField
                label="🛍️ Normal Price (৳) — Retail *"
                icon="pricetag-outline"
                placeholder="Retail price for customers"
                value={form.normalPrice}
                onChangeText={v => setForm({ ...form, normalPrice: v })}
                keyboardType="decimal-pad"
              />
            </View>

            <InputField label="Stock Quantity" icon="layers-outline" placeholder="0" value={form.stock} onChangeText={v => setForm({ ...form, stock: v })} keyboardType="number-pad" />
            <InputField label="Unit" placeholder="pcs / set / pair / kg" value={form.unit} onChangeText={v => setForm({ ...form, unit: v })} />
            <InputField label="Low Stock Alert at" placeholder="5" value={form.lowStockAlert} onChangeText={v => setForm({ ...form, lowStockAlert: v })} keyboardType="number-pad" />
            <InputField label="Description / Notes" placeholder="Optional..." value={form.description} onChangeText={v => setForm({ ...form, description: v })} multiline numberOfLines={3} />

            <BigButton title="Save Product" icon="checkmark-circle-outline" onPress={handleSave} style={{ marginTop: 8 }} />
            <View style={{ height: 60 }} />
          </View>
        </ScrollView>
      </Modal>

      {/* ── View Detail Modal ── */}
      <Modal visible={modalType === 'view'} transparent animationType="slide">
        <View style={styles.bottomSheet}>
          <ScrollView style={styles.bottomSheetContent}>
            <View style={styles.sheetHandle} />
            <Text style={styles.viewName}>{selected?.name}</Text>
            <Badge label={selected?.category} color={COLORS.primary} />

            <View style={styles.viewPriceGrid}>
              {isAdmin ? (
                <ViewPriceCard label="Buying Price" sub="Admin only" value={formatCurrency(selected?.buyingPrice || 0)} color="#7b1fa2" icon="lock-closed-outline" />
              ) : (
                <ViewPriceCard label="Secret Code" sub="Buying code" value={selected?.secretCode} color="#7b1fa2" icon="eye-off-outline" isCode />
              )}
              <ViewPriceCard label="Paikari" sub="Wholesale" value={formatCurrency(selected?.paikariPrice || 0)} color={COLORS.primaryLight} icon="people-outline" />
              <ViewPriceCard label="Normal" sub="Retail" value={formatCurrency(selected?.normalPrice || 0)} color={COLORS.success} icon="pricetag-outline" />
            </View>

            <View style={styles.detailList}>
              <DR label="Barcode" value={selected?.barcode} />
              <DR label="Stock" value={`${selected?.stock} ${selected?.unit}`} />
              <DR label="Low Stock Alert" value={`${selected?.lowStockAlert} ${selected?.unit}`} />
              {isAdmin && selected?.updatedAt && <DR label="Last Updated" value={new Date(selected.updatedAt).toLocaleDateString()} />}
              {selected?.description && <DR label="Notes" value={selected?.description} />}
            </View>

            <BigButton title="Close" variant="outline" onPress={() => setModalType(null)} style={{ marginTop: 16, marginBottom: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* ── Restock Modal ── */}
      <Modal visible={modalType === 'restock'} transparent animationType="slide">
        <View style={styles.bottomSheet}>
          <View style={[styles.bottomSheetContent, { padding: 28 }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.modalTitle}>Restock</Text>
            <Text style={styles.restockProductName}>{selected?.name}</Text>
            <Text style={styles.restockCurrent}>Current stock: <Text style={{ fontWeight: '800', color: COLORS.primary }}>{selected?.stock} {selected?.unit}</Text></Text>
            <InputField label="Quantity to Add" icon="add-circle-outline" placeholder="e.g. 20" value={restockQty} onChangeText={setRestockQty} keyboardType="number-pad" />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <BigButton title="Cancel" variant="outline" onPress={() => setModalType(null)} style={{ flex: 1 }} />
              <BigButton title="Add Stock" icon="checkmark-outline" onPress={handleRestock} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={!!deleteConfirm}
        title="Delete Product?"
        message={`"${deleteConfirm?.name}" will be permanently removed from inventory.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => { deleteProduct(deleteConfirm.id); setDeleteConfirm(null); }}
        onCancel={() => setDeleteConfirm(null)}
      />
    </View>
  );
}

function PriceChip({ label, value, color, isCode }) {
  return (
    <View style={[styles.priceChip, { borderColor: color + '30', backgroundColor: color + '0d' }]}>
      <Text style={[styles.priceChipLabel, { color }]}>{label}</Text>
      <Text style={[styles.priceChipValue, { color }, isCode && styles.codeFont]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function ViewPriceCard({ label, sub, value, color, icon, isCode }) {
  return (
    <View style={[styles.viewPriceCard, { borderColor: color + '30', backgroundColor: color + '0d' }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.viewPriceLabel, { color }]}>{label}</Text>
      <Text style={styles.viewPriceSub}>{sub}</Text>
      <Text style={[styles.viewPriceValue, { color }, isCode && styles.codeFont]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function ActionBtn({ icon, label, color, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.actionBtnWrap, { borderColor: color + '30' }]}>
      <Ionicons name={icon} size={15} color={color} />
      <Text style={[styles.actionBtnText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function DR({ label, value }) {
  return (
    <View style={styles.drRow}>
      <Text style={styles.drLabel}>{label}</Text>
      <Text style={styles.drValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  headerTitle: { fontSize: SIZES.h3, fontWeight: '800', color: COLORS.white },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 14, paddingHorizontal: 14, height: 48, gap: 10 },
  searchInput: { flex: 1, fontSize: SIZES.body, color: COLORS.text },
  catScroll: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  catChip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catChipText: { fontSize: SIZES.small, color: COLORS.textSecondary, fontWeight: '600' },
  catChipTextActive: { color: COLORS.white },
  resultCount: { paddingHorizontal: 20, paddingTop: 10, fontSize: SIZES.small, color: COLORS.textSecondary, fontWeight: '600' },
  productCard: { marginBottom: 10 },
  lowStockCard: { borderLeftWidth: 4, borderLeftColor: COLORS.danger },
  productTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  productIcon: { width: 46, height: 46, borderRadius: 12, backgroundColor: COLORS.primary + '12', alignItems: 'center', justifyContent: 'center' },
  productName: { fontSize: SIZES.body, fontWeight: '800', color: COLORS.text },
  productMeta: { fontSize: SIZES.small, color: COLORS.textSecondary, marginTop: 2 },
  stockBox: { alignItems: 'center', minWidth: 44 },
  stockNum: { fontSize: 22, fontWeight: '900', color: COLORS.primary },
  stockUnit: { fontSize: SIZES.tiny, color: COLORS.textSecondary },
  priceRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  priceChip: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 8, alignItems: 'center' },
  priceChipLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  priceChipValue: { fontSize: SIZES.small, fontWeight: '800', marginTop: 2 },
  codeFont: { fontFamily: 'monospace', letterSpacing: 1 },
  actionRow: { flexDirection: 'row', gap: 6, marginTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 },
  actionBtnWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, borderWidth: 1, borderRadius: 8, paddingVertical: 7 },
  actionBtnText: { fontSize: 11, fontWeight: '700' },
  modalHeaderGrad: { paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalHeaderTitle: { fontSize: SIZES.h3, fontWeight: '800', color: COLORS.white },
  sectionLabel: { fontSize: SIZES.small, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  priceSectionBox: { backgroundColor: '#f8f4ff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1.5, borderColor: '#e1bee7' },
  priceSectionTitle: { fontSize: SIZES.h4, fontWeight: '800', color: '#7b1fa2', marginBottom: 14 },
  priceFieldRow: { flexDirection: 'row', gap: 12 },
  secretBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#ede7f6', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#ce93d8' },
  secretLabel: { fontSize: SIZES.small, fontWeight: '700', color: '#7b1fa2' },
  secretHint: { fontSize: SIZES.tiny, color: '#9c27b0', marginTop: 2, marginBottom: 8 },
  secretInput: { borderWidth: 1.5, borderColor: '#ce93d8', borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: COLORS.white, fontSize: SIZES.body, color: COLORS.text, fontFamily: 'monospace', letterSpacing: 1 },
  bottomSheet: { flex: 1, backgroundColor: 'rgba(26,58,92,0.65)', justifyContent: 'flex-end' },
  bottomSheetContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '88%' },
  sheetHandle: { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16 },
  viewName: { fontSize: SIZES.h2, fontWeight: '900', color: COLORS.text, paddingHorizontal: 24, marginBottom: 8 },
  viewPriceGrid: { flexDirection: 'row', gap: 10, marginTop: 16, marginBottom: 4, paddingHorizontal: 24 },
  viewPriceCard: { flex: 1, borderWidth: 1.5, borderRadius: 14, padding: 12, alignItems: 'center', gap: 4 },
  viewPriceLabel: { fontSize: SIZES.small, fontWeight: '800' },
  viewPriceSub: { fontSize: 10, color: COLORS.textSecondary },
  viewPriceValue: { fontSize: SIZES.body, fontWeight: '900', textAlign: 'center' },
  detailList: { marginTop: 16, paddingHorizontal: 24 },
  drRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  drLabel: { fontSize: SIZES.body, color: COLORS.textSecondary },
  drValue: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.text, maxWidth: '55%', textAlign: 'right' },
  modalTitle: { fontSize: SIZES.h3, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  restockProductName: { fontSize: SIZES.body, color: COLORS.textSecondary, marginBottom: 4 },
  restockCurrent: { fontSize: SIZES.body, color: COLORS.textSecondary, marginBottom: 16 },
});
