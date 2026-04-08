import React from 'react';
import {
  View, Text, TouchableOpacity, TextInput, ActivityIndicator,
  StyleSheet, Modal, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';

// ── Big Button ────────────────────────────────────────────────────────────────
export function BigButton({ title, onPress, icon, variant = 'primary', disabled, loading, style }) {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isOutline = variant === 'outline';

  if (isOutline) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.outlineBtn, style]}
        activeOpacity={0.75}
      >
        {icon && <Ionicons name={icon} size={22} color={COLORS.primary} style={{ marginRight: 8 }} />}
        <Text style={styles.outlineBtnText}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.8} style={style}>
      <LinearGradient
        colors={isDanger ? ['#e53935', '#c62828'] : ['#2a5a8c', '#1a3a5c']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={[styles.bigBtn, SHADOWS.button]}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <>
            {icon && <Ionicons name={icon} size={22} color={COLORS.white} style={{ marginRight: 8 }} />}
            <Text style={styles.bigBtnText}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ── Input Field ───────────────────────────────────────────────────────────────
export function InputField({ label, icon, error, ...props }) {
  return (
    <View style={styles.inputWrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputBox, error && styles.inputError]}>
        {icon && <Ionicons name={icon} size={22} color={COLORS.textSecondary} style={{ marginRight: 10 }} />}
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.textLight}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, style }) {
  return <View style={[styles.card, SHADOWS.card, style]}>{children}</View>;
}

// ── Section Header ────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action, actionLabel }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {action && (
        <TouchableOpacity onPress={action} style={styles.sectionAction}>
          <Text style={styles.sectionActionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ label, color = COLORS.accent }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ title, value, icon, color = COLORS.primary, subtitle }) {
  return (
    <Card style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={26} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </Card>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon} size={64} color={COLORS.border} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    </View>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
export function ConfirmModal({ visible, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.confirmModal}>
          <Text style={styles.confirmTitle}>{title}</Text>
          <Text style={styles.confirmMsg}>{message}</Text>
          <View style={styles.confirmActions}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <BigButton
              title={confirmLabel}
              onPress={onConfirm}
              variant={danger ? 'danger' : 'primary'}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Screen Header ─────────────────────────────────────────────────────────────
export function ScreenHeader({ title, subtitle, onBack, rightAction, rightIcon }) {
  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.primaryLight]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={styles.screenHeader}
    >
      <View style={styles.headerRow}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={26} color={COLORS.white} />
          </TouchableOpacity>
        ) : <View style={{ width: 40 }} />}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
        {rightAction ? (
          <TouchableOpacity onPress={rightAction} style={styles.backBtn}>
            <Ionicons name={rightIcon || 'ellipsis-vertical'} size={24} color={COLORS.white} />
          </TouchableOpacity>
        ) : <View style={{ width: 40 }} />}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bigBtn: {
    height: SIZES.buttonHeight,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  bigBtnText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  outlineBtn: {
    height: SIZES.buttonHeight,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  outlineBtnText: {
    color: COLORS.primary,
    fontSize: SIZES.body,
    fontWeight: '700',
  },
  inputWrapper: { marginBottom: 16 },
  label: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusSm,
    paddingHorizontal: 14,
    height: SIZES.inputHeight,
  },
  inputError: { borderColor: COLORS.danger },
  input: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.text,
  },
  errorText: { color: COLORS.danger, fontSize: SIZES.small, marginTop: 4 },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionAction: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  sectionActionText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: SIZES.small,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: SIZES.tiny, fontWeight: '700' },
  statCard: { flex: 1, alignItems: 'center', padding: 16 },
  statIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: SIZES.h3,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  statTitle: {
    fontSize: SIZES.tiny,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '600',
  },
  statSubtitle: {
    fontSize: SIZES.tiny,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmModal: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: 28,
    width: '100%',
  },
  confirmTitle: {
    fontSize: SIZES.h3,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 10,
  },
  confirmMsg: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginBottom: 24,
    lineHeight: 24,
  },
  confirmActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    height: SIZES.buttonHeight,
    borderRadius: SIZES.radius,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: SIZES.body,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  screenHeader: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: SIZES.small,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 2,
  },
});
