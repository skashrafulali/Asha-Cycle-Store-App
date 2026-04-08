import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Card, StatCard, SectionHeader, Badge } from '../components/UI';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';
import { formatCurrency, formatDate } from '../utils/helpers';

export default function DashboardScreen({ navigation }) {
  const { currentUser, products, sales, getStats, logout } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('today');

  const stats = getStats(period);
  const lowStock = products.filter(p => p.stock <= p.lowStockAlert);
  const recentSales = [...sales].reverse().slice(0, 5);

  const isAdmin = currentUser?.role === 'admin';

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const periods = [
    { key: 'today', label: 'Today' },
    { key: 'month', label: 'This Month' },
    { key: 'all', label: 'All Time' },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.logoRow}>
            <Ionicons name="bicycle" size={32} color={COLORS.accent} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.storeName}>Asha Cycle Store</Text>
              <Text style={styles.greeting}>
                Welcome, {currentUser?.name} 👋
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        <View style={styles.periodRow}>
          {periods.map(p => (
            <TouchableOpacity
              key={p.key}
              onPress={() => setPeriod(p.key)}
              style={[styles.periodBtn, period === p.key && styles.periodBtnActive]}
            >
              <Text style={[styles.periodBtnText, period === p.key && styles.periodBtnTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            title="Total Sales"
            value={String(stats.totalSales)}
            icon="receipt-outline"
            color={COLORS.primary}
          />
          <StatCard
            title="Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon="cash-outline"
            color={COLORS.success}
          />
        </View>
        {isAdmin && (
          <View style={styles.statsRow}>
            <StatCard
              title="Profit"
              value={formatCurrency(stats.totalProfit)}
              icon="trending-up-outline"
              color={COLORS.accent}
            />
            <StatCard
              title="Products"
              value={String(products.length)}
              icon="cube-outline"
              color={COLORS.primaryLight}
            />
          </View>
        )}

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <View style={styles.actionsGrid}>
          <QuickAction icon="add-circle" label="New Sale" color="#2e7d32" onPress={() => navigation.navigate('NewSale')} />
          <QuickAction icon="search" label="Search" color={COLORS.primary} onPress={() => navigation.navigate('Inventory')} />
          <QuickAction icon="barcode-outline" label="Scan" color="#6a1b9a" onPress={() => navigation.navigate('Scanner')} />
          <QuickAction icon="receipt-outline" label="Invoices" color="#e65100" onPress={() => navigation.navigate('Invoices')} />
          {isAdmin && <QuickAction icon="cube-outline" label="Inventory" color="#00695c" onPress={() => navigation.navigate('Inventory')} />}
          {isAdmin && <QuickAction icon="people-outline" label="Staff" color="#1565c0" onPress={() => navigation.navigate('Staff')} />}
        </View>

        {/* Low Stock Alert */}
        {lowStock.length > 0 && (
          <>
            <SectionHeader
              title="⚠️ Low Stock Alert"
              subtitle={`${lowStock.length} items need restocking`}
              action={() => navigation.navigate('Inventory')}
              actionLabel="View All"
            />
            {lowStock.slice(0, 3).map(p => (
              <Card key={p.id} style={styles.alertCard}>
                <View style={styles.alertRow}>
                  <View style={styles.alertIcon}>
                    <Ionicons name="warning-outline" size={22} color={COLORS.warning} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertName}>{p.name}</Text>
                    <Text style={styles.alertSub}>{p.category}</Text>
                  </View>
                  <Badge label={`${p.stock} left`} color={p.stock === 0 ? COLORS.danger : COLORS.warning} />
                </View>
              </Card>
            ))}
          </>
        )}

        {/* Recent Sales */}
        <SectionHeader
          title="Recent Sales"
          action={() => navigation.navigate('Invoices')}
          actionLabel="See All"
        />
        {recentSales.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No sales yet today. Start a new sale!</Text>
          </Card>
        ) : (
          recentSales.map(sale => (
            <Card key={sale.id} style={styles.saleCard}>
              <View style={styles.saleRow}>
                <View style={styles.saleIcon}>
                  <Ionicons name="receipt" size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.saleInvoice}>{sale.invoiceNo}</Text>
                  <Text style={styles.saleMeta}>{sale.customerName} · {formatDate(sale.createdAt)}</Text>
                  <Text style={styles.saleMeta}>{sale.items.length} item(s) · by {sale.soldBy}</Text>
                </View>
                <Text style={styles.saleTotal}>{formatCurrency(sale.total)}</Text>
              </View>
            </Card>
          ))
        )}

        <View style={{ height: 100 }} />
      </View>
    </ScrollView>
  );
}

function QuickAction({ icon, label, color, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.qaBtn} activeOpacity={0.8}>
      <LinearGradient
        colors={[color + 'ee', color + 'bb']}
        style={styles.qaGradient}
      >
        <Ionicons name={icon} size={30} color={COLORS.white} />
        <Text style={styles.qaLabel}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  storeName: { fontSize: 20, fontWeight: '900', color: COLORS.white },
  greeting: { fontSize: SIZES.small, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  logoutBtn: { padding: 8 },
  periodRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 30,
    padding: 4,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 26,
    alignItems: 'center',
  },
  periodBtnActive: { backgroundColor: COLORS.white },
  periodBtnText: { fontSize: SIZES.small, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  periodBtnTextActive: { color: COLORS.primary, fontWeight: '700' },
  body: { padding: SIZES.padding },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  qaBtn: { width: '30.5%', borderRadius: SIZES.radius, overflow: 'hidden', ...SHADOWS.card },
  qaGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    aspectRatio: 1,
  },
  qaLabel: { color: COLORS.white, fontWeight: '700', fontSize: SIZES.small, textAlign: 'center' },
  alertCard: { borderLeftWidth: 4, borderLeftColor: COLORS.warning, marginBottom: 8 },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  alertIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.warningLight,
    alignItems: 'center', justifyContent: 'center',
  },
  alertName: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.text },
  alertSub: { fontSize: SIZES.small, color: COLORS.textSecondary },
  saleCard: { marginBottom: 8 },
  saleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  saleIcon: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  saleInvoice: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.text },
  saleMeta: { fontSize: SIZES.tiny, color: COLORS.textSecondary, marginTop: 2 },
  saleTotal: { fontSize: SIZES.body, fontWeight: '800', color: COLORS.success },
  emptyText: { color: COLORS.textSecondary, textAlign: 'center', fontSize: SIZES.body },
});
