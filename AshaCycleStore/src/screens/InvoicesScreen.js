import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, ScrollView, Share, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { Card, StatCard, EmptyState } from '../components/UI';
import { COLORS, SIZES } from '../utils/theme';
import { formatCurrency, formatDateTime, formatDate, generateInvoiceHTML } from '../utils/helpers';

export default function InvoicesScreen({ navigation }) {
  const { sales, getStats, currentUser } = useApp();
  const isAdmin = currentUser?.role === 'admin';
  const [selected, setSelected] = useState(null);
  const [period, setPeriod] = useState('all');

  const periods = [
    { key: 'today', label: "Today" },
    { key: 'month', label: "Month" },
    { key: 'all', label: "All Time" },
  ];

  const stats = getStats(period);

  const filteredSales = useMemo(() => {
    const now = new Date();
    let s = [...sales].reverse();
    if (period === 'today') s = s.filter(sale => new Date(sale.createdAt).toDateString() === now.toDateString());
    if (period === 'month') s = s.filter(sale => {
      const d = new Date(sale.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return s;
  }, [sales, period]);

  const shareInvoice = async (sale) => {
    try {
      await Share.share({
        message: `Invoice ${sale.invoiceNo}\nCustomer: ${sale.customerName}\nDate: ${formatDateTime(sale.createdAt)}\n\nItems:\n${sale.items.map(i => `• ${i.name} x${i.qty} = ${formatCurrency(i.sellingPrice * i.qty)}`).join('\n')}\n\nTotal: ${formatCurrency(sale.total)}\n\nAsha Cycle Store`,
        title: `Invoice ${sale.invoiceNo}`,
      });
    } catch (e) {
      Alert.alert('Share Error', 'Could not share invoice');
    }
  };

  const renderSale = ({ item: sale }) => (
    <TouchableOpacity onPress={() => setSelected(sale)} activeOpacity={0.85}>
      <Card style={styles.saleCard}>
        <View style={styles.saleTop}>
          <View style={styles.invoiceBadge}>
            <Ionicons name="receipt" size={20} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.invoiceNo}>{sale.invoiceNo}</Text>
            <Text style={styles.saleMeta}>{sale.customerName}</Text>
            <Text style={styles.saleMeta}>{formatDateTime(sale.createdAt)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.saleTotal}>{formatCurrency(sale.total)}</Text>
            {isAdmin && <Text style={styles.saleProfit}>+{formatCurrency(sale.profit)} profit</Text>}
            <Text style={styles.saleItems}>{sale.items.length} item(s)</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#e65100', '#bf360c']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invoices & Reports</Text>
          <View style={{ width: 26 }} />
        </View>

        {/* Period Tabs */}
        <View style={styles.periodRow}>
          {periods.map(p => (
            <TouchableOpacity key={p.key} onPress={() => setPeriod(p.key)}
              style={[styles.periodBtn, period === p.key && styles.periodBtnActive]}>
              <Text style={[styles.periodText, period === p.key && styles.periodTextActive]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <StatCard title="Sales" value={String(stats.totalSales)} icon="receipt-outline" color="#e65100" />
          <StatCard title="Revenue" value={formatCurrency(stats.totalRevenue)} icon="cash-outline" color={COLORS.success} />
          {isAdmin && <StatCard title="Profit" value={formatCurrency(stats.totalProfit)} icon="trending-up-outline" color={COLORS.accent} />}
        </View>
      </View>

      <FlatList
        data={filteredSales}
        keyExtractor={s => s.id}
        renderItem={renderSale}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={<EmptyState icon="receipt-outline" title="No sales yet" subtitle="Start a new sale from the dashboard" />}
      />

      {/* Invoice Detail Modal */}
      <Modal visible={!!selected} animationType="slide">
        <ScrollView style={styles.detailModal}>
          <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.detailHeader}>
            <TouchableOpacity onPress={() => setSelected(null)} style={{ marginBottom: 12 }}>
              <Ionicons name="close" size={28} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.detailInvoiceNo}>{selected?.invoiceNo}</Text>
            <Text style={styles.detailDate}>{selected && formatDateTime(selected.createdAt)}</Text>
          </LinearGradient>

          <View style={styles.detailBody}>
            <View style={styles.detailMeta}>
              <MetaRow label="Customer" value={selected?.customerName} />
              <MetaRow label="Served By" value={selected?.soldBy} />
            </View>

            <Text style={styles.itemsTitle}>Items Sold</Text>
            {selected?.items.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQty}>
                    {formatCurrency(item.sellingPrice)} × {item.qty}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>{formatCurrency(item.sellingPrice * item.qty)}</Text>
              </View>
            ))}

            <View style={styles.divider} />
            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>{formatCurrency(selected?.total || 0)}</Text>
              </View>
              {isAdmin && (
                <View style={[styles.totalRow, { marginTop: 6 }]}>
                  <Text style={[styles.totalLabel, { color: COLORS.success }]}>Profit</Text>
                  <Text style={[styles.totalValue, { color: COLORS.success }]}>
                    {formatCurrency(selected?.profit || 0)}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity onPress={() => shareInvoice(selected)} style={styles.shareBtn}>
              <Ionicons name="share-outline" size={22} color={COLORS.primary} />
              <Text style={styles.shareBtnText}>Share Invoice</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

function MetaRow({ label, value }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerTitle: { fontSize: SIZES.h3, fontWeight: '800', color: COLORS.white },
  periodRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 30, padding: 4 },
  periodBtn: { flex: 1, paddingVertical: 8, borderRadius: 26, alignItems: 'center' },
  periodBtnActive: { backgroundColor: COLORS.white },
  periodText: { fontSize: SIZES.small, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  periodTextActive: { color: '#e65100', fontWeight: '700' },
  statsContainer: { padding: 16, paddingBottom: 4 },
  statsRow: { flexDirection: 'row', gap: 10 },
  saleCard: { marginBottom: 10 },
  saleTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  invoiceBadge: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.primary + '12',
    alignItems: 'center', justifyContent: 'center',
  },
  invoiceNo: { fontSize: SIZES.body, fontWeight: '800', color: COLORS.text },
  saleMeta: { fontSize: SIZES.tiny, color: COLORS.textSecondary, marginTop: 1 },
  saleTotal: { fontSize: SIZES.body, fontWeight: '900', color: COLORS.success },
  saleProfit: { fontSize: SIZES.tiny, color: COLORS.success, marginTop: 2 },
  saleItems: { fontSize: SIZES.tiny, color: COLORS.textLight, marginTop: 2 },
  detailModal: { flex: 1, backgroundColor: COLORS.background },
  detailHeader: { paddingTop: 52, paddingHorizontal: 24, paddingBottom: 28 },
  detailInvoiceNo: { fontSize: 28, fontWeight: '900', color: COLORS.white },
  detailDate: { fontSize: SIZES.small, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  detailBody: { padding: 24 },
  detailMeta: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 24, elevation: 2 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  metaLabel: { fontSize: SIZES.body, color: COLORS.textSecondary },
  metaValue: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.text },
  itemsTitle: { fontSize: SIZES.h4, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  itemName: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.text },
  itemQty: { fontSize: SIZES.small, color: COLORS.textSecondary, marginTop: 2 },
  itemTotal: { fontSize: SIZES.body, fontWeight: '800', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  totalSection: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 20, elevation: 2 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: SIZES.h4, fontWeight: '700', color: COLORS.text },
  totalValue: { fontSize: SIZES.h3, fontWeight: '900', color: COLORS.text },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderWidth: 2, borderColor: COLORS.primary, borderRadius: 16, paddingVertical: 16,
  },
  shareBtnText: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.primary },
});
