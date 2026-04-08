import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

const INITIAL_USERS = [
  { id: 'owner-1', username: 'ansar', password: 'asha', role: 'admin', name: 'Ansar (Owner)', createdAt: new Date().toISOString() },
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod-001', barcode: '8901234567890', name: 'Bicycle Chain (Standard)',
    category: 'Chain & Drive',
    buyingPrice: 120,        // Admin only — real cost
    secretCode: 'BC-A1',    // Staff sees this instead of buying price
    paikariPrice: 160,       // Wholesale / resell price
    normalPrice: 200,        // Retail price
    stock: 25, unit: 'pcs', description: 'Standard 7-speed bicycle chain', lowStockAlert: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-002', barcode: '8901234567891', name: 'Inner Tube 26"',
    category: 'Tyres & Tubes',
    buyingPrice: 80, secretCode: 'IT-B2', paikariPrice: 110, normalPrice: 150,
    stock: 40, unit: 'pcs', description: '26 inch standard inner tube', lowStockAlert: 10,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-003', barcode: '8901234567892', name: 'Brake Pad Set',
    category: 'Brakes',
    buyingPrice: 60, secretCode: 'BP-C3', paikariPrice: 90, normalPrice: 120,
    stock: 30, unit: 'set', description: 'Universal brake pads', lowStockAlert: 8,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-004', barcode: '8901234567893', name: 'Gear Cable Set',
    category: 'Cables',
    buyingPrice: 45, secretCode: 'GC-D4', paikariPrice: 65, normalPrice: 90,
    stock: 20, unit: 'set', description: 'Shift cable & housing set', lowStockAlert: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-005', barcode: '8901234567894', name: 'Handlebar Grip Pair',
    category: 'Handlebar',
    buyingPrice: 35, secretCode: 'HG-E5', paikariPrice: 55, normalPrice: 75,
    stock: 50, unit: 'pair', description: 'Rubber handlebar grips', lowStockAlert: 10,
    createdAt: new Date().toISOString(),
  },
];

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [u, p, s, cu] = await Promise.all([
        AsyncStorage.getItem('acs_users'), AsyncStorage.getItem('acs_products'),
        AsyncStorage.getItem('acs_sales'), AsyncStorage.getItem('acs_currentUser'),
      ]);
      if (u) setUsers(JSON.parse(u));
      if (p) setProducts(JSON.parse(p));
      if (s) setSales(JSON.parse(s));
      if (cu) setCurrentUser(JSON.parse(cu));
    } catch (e) {}
    setLoading(false);
  };

  const persist = async (key, value) => { try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch (e) {} };

  // Auth
  const login = (username, password) => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (user) { setCurrentUser(user); persist('acs_currentUser', user); return { success: true, user }; }
    return { success: false, error: 'Invalid username or password' };
  };
  const logout = () => { setCurrentUser(null); AsyncStorage.removeItem('acs_currentUser'); };
  const registerStaff = (data) => {
    if (users.find(u => u.username.toLowerCase() === data.username.toLowerCase()))
      return { success: false, error: 'Username already exists' };
    const newUser = { id: 'staff-' + Date.now(), ...data, role: 'staff', createdAt: new Date().toISOString() };
    const updated = [...users, newUser];
    setUsers(updated); persist('acs_users', updated);
    return { success: true };
  };
  const deleteStaff = (id) => { const u = users.filter(x => x.id !== id); setUsers(u); persist('acs_users', u); };
  const updateStaffPassword = (id, newPassword) => {
    const u = users.map(x => x.id === id ? { ...x, password: newPassword } : x);
    setUsers(u); persist('acs_users', u);
  };

  // Products — full CRUD
  const addProduct = (product) => {
    const p = { ...product, id: 'prod-' + Date.now(), createdAt: new Date().toISOString() };
    const updated = [...products, p]; setProducts(updated); persist('acs_products', updated); return p;
  };
  const updateProduct = (id, data) => {
    const updated = products.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p);
    setProducts(updated); persist('acs_products', updated);
  };
  const deleteProduct = (id) => { const u = products.filter(p => p.id !== id); setProducts(u); persist('acs_products', u); };
  const restockProduct = (id, qty) => {
    const u = products.map(p => p.id === id ? { ...p, stock: p.stock + qty } : p);
    setProducts(u); persist('acs_products', u);
  };
  const getProductByBarcode = (barcode) => products.find(p => p.barcode === barcode) || null;

  // Sales
  const createSale = (items, customerName = 'Walk-in Customer', priceType = 'normal') => {
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const profit = items.reduce((s, i) => s + (i.price - (i.buyingPrice || 0)) * i.qty, 0);
    const sale = {
      id: 'sale-' + Date.now(),
      invoiceNo: 'INV-' + String(sales.length + 1).padStart(4, '0'),
      items, total, profit, customerName, priceType,
      soldBy: currentUser?.name, createdAt: new Date().toISOString(),
    };
    const updatedP = products.map(p => {
      const item = items.find(i => i.productId === p.id);
      return item ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p;
    });
    setProducts(updatedP); persist('acs_products', updatedP);
    const updatedS = [...sales, sale]; setSales(updatedS); persist('acs_sales', updatedS);
    return sale;
  };

  const getStats = (period = 'all') => {
    const now = new Date();
    let f = sales;
    if (period === 'today') f = sales.filter(s => new Date(s.createdAt).toDateString() === now.toDateString());
    else if (period === 'month') f = sales.filter(s => { const d = new Date(s.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    return {
      totalSales: f.length,
      totalRevenue: f.reduce((s, sale) => s + sale.total, 0),
      totalProfit: f.reduce((s, sale) => s + sale.profit, 0),
    };
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, products, sales, loading,
      login, logout, registerStaff, deleteStaff, updateStaffPassword,
      addProduct, updateProduct, deleteProduct, restockProduct, getProductByBarcode,
      createSale, getStats,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
