import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

import { useApp } from '../context/AppContext';
import { COLORS, SIZES } from '../utils/theme';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import InventoryScreen from '../screens/InventoryScreen';
import NewSaleScreen from '../screens/NewSaleScreen';
import InvoicesScreen from '../screens/InvoicesScreen';
import StaffScreen from '../screens/StaffScreen';
import ScannerScreen from '../screens/ScannerScreen';
import BarcodeGeneratorScreen from '../screens/BarcodeGeneratorScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { currentUser, products } = useApp();
  const isAdmin = currentUser?.role === 'admin';
  const lowStockCount = products.filter(p => p.stock <= p.lowStockAlert).length;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Dashboard: focused ? 'home' : 'home-outline',
            Inventory: focused ? 'cube' : 'cube-outline',
            NewSale: focused ? 'add-circle' : 'add-circle-outline',
            Invoices: focused ? 'receipt' : 'receipt-outline',
            Scanner: focused ? 'barcode' : 'barcode-outline',
          };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Home' }} />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          title: 'Stock',
          tabBarBadge: lowStockCount > 0 ? lowStockCount : undefined,
          tabBarBadgeStyle: { backgroundColor: COLORS.danger },
        }}
      />
      <Tab.Screen
        name="NewSale"
        component={NewSaleScreen}
        options={{
          title: 'New Sale',
          tabBarIcon: ({ focused }) => (
            <View style={styles.saleTabBtn}>
              <Ionicons name="add" size={28} color={COLORS.white} />
            </View>
          ),
          tabBarLabel: () => <Text style={styles.saleTabLabel}>New Sale</Text>,
        }}
      />
      <Tab.Screen name="Invoices" component={InvoicesScreen} options={{ title: 'Reports' }} />
      <Tab.Screen name="Scanner" component={ScannerScreen} options={{ title: 'Scan' }} />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="Staff" component={StaffScreen} />
      <Stack.Screen name="BarcodeGen" component={BarcodeGeneratorScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { currentUser, loading } = useApp();

  if (loading) return null;

  return (
    <NavigationContainer>
      {currentUser ? <MainStack /> : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    paddingBottom: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  saleTabBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  saleTabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
    marginTop: -4,
  },
});
