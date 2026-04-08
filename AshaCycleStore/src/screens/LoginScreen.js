import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { BigButton, InputField } from '../components/UI';
import { COLORS, SIZES } from '../utils/theme';

export default function LoginScreen() {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!username.trim()) e.username = 'Please enter your username';
    if (!password.trim()) e.password = 'Please enter your password';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      const result = login(username.trim(), password);
      if (!result.success) {
        Alert.alert('Login Failed', result.error);
      }
      setLoading(false);
    }, 600);
  };

  return (
    <LinearGradient
      colors={[COLORS.primary, '#0d2442', '#0a1a30']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={styles.logoWrapper}>
            <View style={styles.logoCircle}>
              <Ionicons name="bicycle" size={56} color={COLORS.accent} />
            </View>
            <Text style={styles.storeName}>Asha Cycle Store</Text>
            <Text style={styles.tagline}>Motor Parts & Cycle Shop</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subText}>Please sign in to continue</Text>

            <InputField
              label="Username"
              icon="person-outline"
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              error={errors.username}
            />

            <View style={{ position: 'relative' }}>
              <InputField
                label="Password"
                icon="lock-closed-outline"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                error={errors.password}
              />
              <TouchableOpacity
                onPress={() => setShowPass(!showPass)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPass ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <BigButton
              title="Sign In"
              icon="log-in-outline"
              onPress={handleLogin}
              loading={loading}
              style={{ marginTop: 8 }}
            />

            <View style={styles.hint}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.hintText}>
                Owner: username <Text style={{ fontWeight: '700' }}>ansar</Text>
              </Text>
            </View>
          </View>

          <Text style={styles.footer}>© 2024 Asha Cycle Store · All rights reserved</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: SIZES.padding },
  logoWrapper: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.accent + '50',
  },
  storeName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: SIZES.small,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  welcomeText: {
    fontSize: SIZES.h2,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  subText: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 38,
    padding: 4,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 6,
  },
  hintText: { fontSize: SIZES.small, color: COLORS.textSecondary },
  footer: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: SIZES.tiny,
    marginTop: 24,
  },
});
