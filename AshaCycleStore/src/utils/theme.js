export const COLORS = {
  primary: '#1a3a5c',       // Deep navy blue
  primaryLight: '#2a5a8c',
  accent: '#e8a020',        // Warm amber/gold
  accentLight: '#f5c060',
  success: '#2e7d32',
  successLight: '#e8f5e9',
  danger: '#c62828',
  dangerLight: '#ffebee',
  warning: '#f57c00',
  warningLight: '#fff3e0',
  white: '#ffffff',
  background: '#f4f6f9',
  cardBg: '#ffffff',
  text: '#1a1a2e',
  textSecondary: '#5a6070',
  textLight: '#9aa0ad',
  border: '#dde2ea',
  shadow: 'rgba(26,58,92,0.12)',
  overlay: 'rgba(26,58,92,0.7)',
};

export const SIZES = {
  // Font sizes - larger for older users
  h1: 28,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  small: 14,
  tiny: 12,

  // Spacing
  padding: 20,
  radius: 16,
  radiusSm: 10,
  radiusLg: 24,

  // Touch targets - large for older users
  buttonHeight: 56,
  inputHeight: 56,
  iconSize: 28,
};

export const SHADOWS = {
  card: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  button: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};

export const CATEGORIES = [
  'Chain & Drive',
  'Tyres & Tubes',
  'Brakes',
  'Cables',
  'Handlebar',
  'Wheels & Rims',
  'Pedals',
  'Saddle & Seat Post',
  'Lights & Reflectors',
  'Accessories',
  'Tools',
  'Other',
];
