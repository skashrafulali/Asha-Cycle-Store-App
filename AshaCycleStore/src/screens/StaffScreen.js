import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { BigButton, InputField, Card, Badge, ConfirmModal, EmptyState } from '../components/UI';
import { COLORS, SIZES } from '../utils/theme';

export default function StaffScreen({ navigation }) {
  const { users, currentUser, registerStaff, deleteStaff, updateStaffPassword } = useApp();
  const staffList = users.filter(u => u.role !== 'admin');

  const [addModal, setAddModal] = useState(false);
  const [passModal, setPassModal] = useState(null); // staff object
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ name: '', username: '', password: '', confirmPass: '' });
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  const validateAdd = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.username.trim() || form.username.length < 3) e.username = 'Min 3 characters';
    if (!form.password || form.password.length < 4) e.password = 'Min 4 characters';
    if (form.password !== form.confirmPass) e.confirmPass = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = () => {
    if (!validateAdd()) return;
    const result = registerStaff({ name: form.name, username: form.username, password: form.password });
    if (result.success) {
      setAddModal(false);
      setForm({ name: '', username: '', password: '', confirmPass: '' });
      Alert.alert('✅ Success', `"${form.name}" added as staff.`);
    } else Alert.alert('Error', result.error);
  };

  const handleChangePass = () => {
    if (!newPass || newPass.length < 4) { Alert.alert('Error', 'Password must be at least 4 characters'); return; }
    if (newPass !== confirmNewPass) { Alert.alert('Error', 'Passwords do not match'); return; }
    updateStaffPassword(passModal.id, newPass);
    setPassModal(null); setNewPass(''); setConfirmNewPass('');
    Alert.alert('✅ Done', 'Password updated successfully.');
  };

  const renderStaff = ({ item: staff }) => (
    <Card style={styles.staffCard}>
      <View style={styles.staffTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{staff.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.staffName}>{staff.name}</Text>
          <Text style={styles.staffUsername}>@{staff.username}</Text>
          <Text style={styles.staffDate}>Added {new Date(staff.createdAt).toLocaleDateString('en-BD')}</Text>
        </View>
        <Badge label="Staff" color={COLORS.primaryLight} />
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.primary} />
        <Text style={styles.infoText}>Can view: Secret Code · Paikari Price · Normal Price</Text>
      </View>
      <View style={[styles.infoBox, { backgroundColor: '#fff3e0', borderColor: '#ffe0b2' }]}>
        <Ionicons name="lock-closed-outline" size={16} color={COLORS.warning} />
        <Text style={[styles.infoText, { color: COLORS.warning }]}>Cannot see: Buying Price (shown as secret code only)</Text>
      </View>

      <View style={styles.staffActions}>
        <TouchableOpacity onPress={() => { setPassModal(staff); setNewPass(''); setConfirmNewPass(''); }} style={styles.staffActionBtn}>
          <Ionicons name="key-outline" size={16} color={COLORS.primary} />
          <Text style={[styles.staffActionText, { color: COLORS.primary }]}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setDeleteConfirm(staff)} style={[styles.staffActionBtn, { borderColor: COLORS.danger + '40', backgroundColor: COLORS.dangerLight }]}>
          <Ionicons name="person-remove-outline" size={16} color={COLORS.danger} />
          <Text style={[styles.staffActionText, { color: COLORS.danger }]}>Remove</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1565c0', '#0d47a1']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Staff Management</Text>
          <TouchableOpacity onPress={() => { setForm({ name: '', username: '', password: '', confirmPass: '' }); setErrors({}); setAddModal(true); }} style={styles.addBtn}>
            <Ionicons name="person-add-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.summaryRow}>
          <SumItem num={staffList.length} label="Staff Members" />
          <View style={styles.sumDivider} />
          <SumItem num="1" label="Admin (Owner)" />
          <View style={styles.sumDivider} />
          <SumItem num={users.length} label="Total Users" />
        </View>
      </LinearGradient>

      {/* Admin card */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <Card style={styles.adminCard}>
          <View style={styles.staffTop}>
            <View style={[styles.avatar, { backgroundColor: COLORS.accent + '20' }]}>
              <Text style={[styles.avatarText, { color: COLORS.accent }]}>{currentUser?.name?.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.staffName}>{currentUser?.name}</Text>
              <Text style={styles.staffUsername}>@{currentUser?.username}</Text>
            </View>
            <Badge label="Owner / Admin" color={COLORS.accent} />
          </View>
          <View style={[styles.infoBox, { backgroundColor: '#fff8e1', borderColor: '#ffe082' }]}>
            <Ionicons name="eye-outline" size={16} color={COLORS.accent} />
            <Text style={[styles.infoText, { color: '#f57c00' }]}>Full access: Buying Price · Paikari · Normal · All reports</Text>
          </View>
        </Card>
      </View>

      <FlatList
        data={staffList}
        keyExtractor={s => s.id}
        renderItem={renderStaff}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        ListEmptyComponent={
          <EmptyState icon="people-outline" title="No staff members yet" subtitle="Tap + to add your first staff member" />
        }
      />

      {/* Add Staff Modal */}
      <Modal visible={addModal} animationType="slide">
        <ScrollView style={{ flex: 1, backgroundColor: COLORS.white }} keyboardShouldPersistTaps="handled">
          <LinearGradient colors={['#1565c0', '#0d47a1']} style={styles.modalGradHeader}>
            <TouchableOpacity onPress={() => setAddModal(false)}>
              <Ionicons name="close" size={28} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Add Staff Member</Text>
            <View style={{ width: 28 }} />
          </LinearGradient>
          <View style={{ padding: 24 }}>
            <View style={styles.noteBox}>
              <Ionicons name="information-circle" size={20} color={COLORS.primary} />
              <Text style={styles.noteText}>Staff members will see the <Text style={{ fontWeight: '800' }}>secret code</Text> instead of the buying price. They can view paikari and normal prices.</Text>
            </View>
            <InputField label="Full Name *" icon="person-outline" placeholder="e.g. Karim Ahmed" value={form.name} onChangeText={v => setForm({ ...form, name: v })} error={errors.name} />
            <InputField label="Username *" icon="at-outline" placeholder="e.g. karim123" value={form.username} onChangeText={v => setForm({ ...form, username: v })} autoCapitalize="none" error={errors.username} />
            <InputField label="Password *" icon="lock-closed-outline" placeholder="Min 4 characters" value={form.password} onChangeText={v => setForm({ ...form, password: v })} secureTextEntry={!showPass} error={errors.password} />
            <InputField label="Confirm Password *" icon="lock-closed-outline" placeholder="Repeat password" value={form.confirmPass} onChangeText={v => setForm({ ...form, confirmPass: v })} secureTextEntry={!showPass} error={errors.confirmPass} />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.showPassBtn}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.primary} />
              <Text style={styles.showPassText}>{showPass ? 'Hide' : 'Show'} Passwords</Text>
            </TouchableOpacity>
            <BigButton title="Add Staff Member" icon="person-add-outline" onPress={handleAdd} style={{ marginTop: 8 }} />
          </View>
        </ScrollView>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={!!passModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.passSheet}>
            <Text style={styles.passTitle}>Change Password</Text>
            <Text style={styles.passFor}>{passModal?.name} (@{passModal?.username})</Text>
            <InputField label="New Password" icon="lock-closed-outline" placeholder="Min 4 characters" value={newPass} onChangeText={setNewPass} secureTextEntry />
            <InputField label="Confirm New Password" icon="lock-closed-outline" placeholder="Repeat password" value={confirmNewPass} onChangeText={setConfirmNewPass} secureTextEntry />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <BigButton title="Cancel" variant="outline" onPress={() => setPassModal(null)} style={{ flex: 1 }} />
              <BigButton title="Update" icon="checkmark-outline" onPress={handleChangePass} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={!!deleteConfirm}
        title="Remove Staff?"
        message={`"${deleteConfirm?.name}" will lose all access to the app.`}
        confirmLabel="Remove"
        danger
        onConfirm={() => { deleteStaff(deleteConfirm.id); setDeleteConfirm(null); }}
        onCancel={() => setDeleteConfirm(null)}
      />
    </View>
  );
}

function SumItem({ num, label }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ fontSize: 28, fontWeight: '900', color: COLORS.white }}>{num}</Text>
      <Text style={{ fontSize: SIZES.small, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerTitle: { fontSize: SIZES.h3, fontWeight: '800', color: COLORS.white },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 16 },
  sumDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  adminCard: { borderLeftWidth: 4, borderLeftColor: COLORS.accent, marginBottom: 0 },
  staffCard: { marginBottom: 12 },
  staffTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary + '15', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  staffName: { fontSize: SIZES.body, fontWeight: '700', color: COLORS.text },
  staffUsername: { fontSize: SIZES.small, color: COLORS.textSecondary },
  staffDate: { fontSize: SIZES.tiny, color: COLORS.textLight, marginTop: 2 },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#e8f4fd', borderRadius: 10, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: COLORS.primary + '25' },
  infoText: { flex: 1, fontSize: SIZES.small, color: COLORS.primary, lineHeight: 18 },
  staffActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  staffActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.primary + '30', borderRadius: 10, paddingVertical: 10, backgroundColor: COLORS.primary + '08' },
  staffActionText: { fontSize: SIZES.small, fontWeight: '700' },
  modalGradHeader: { paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalHeaderTitle: { fontSize: SIZES.h3, fontWeight: '800', color: COLORS.white },
  noteBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: COLORS.primary + '10', borderRadius: 12, padding: 14, marginBottom: 20 },
  noteText: { flex: 1, fontSize: SIZES.small, color: COLORS.primary, lineHeight: 20 },
  showPassBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  showPassText: { fontSize: SIZES.small, color: COLORS.primary, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  passSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 40 },
  passTitle: { fontSize: SIZES.h3, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  passFor: { fontSize: SIZES.body, color: COLORS.textSecondary, marginBottom: 20 },
});
