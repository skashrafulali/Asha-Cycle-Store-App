# Asha-Cycle-Store-App
Asha Cycle Store is a streamlined inventory and sales management mobile application specifically designed for small business owners in the motor parts industry. Built with a focus on accessibility and ease of use, the app allows owners to manage high-volume stock with minimal technical friction.


# 🚲 Asha Cycle Store - Mobile App

A fully-featured mobile inventory management app for Asha Cycle Store, built with **React Native (Expo)**.

---

## 🔐 Admin Login

| Field    | Value  |
|----------|--------|
| Username | `ansar`  |
| Password | `asha`   |
| Role     | Admin (Owner) |

---

## 📱 Features

### ✅ Authentication
- Secure login for Owner (admin) and Staff
- Admin can add/remove staff and manage permissions
- Staff cannot view buying prices (configurable)

### ✅ Dashboard
- Today / Month / All-time stats
- Total sales, revenue, and profit (admin only)
- Low stock alerts
- Quick action buttons
- Recent sales list

### ✅ Inventory Management (Admin)
- Add, edit, delete products
- Auto-generate barcodes (EAN-13 format)
- Categories, units, descriptions
- Buying & selling price tracking
- Low stock alert threshold per product
- Search & filter by category

### ✅ Barcode Scanner
- Scan EAN-13, Code 128, QR codes, UPC, etc.
- Instantly shows product details on scan
- Torch / flashlight toggle
- Not found? Add product directly

### ✅ Barcode Generator
- Generate visual barcodes for any product
- Custom barcode entry
- Share barcodes via share sheet

### ✅ Sales / POS
- Browse and search products
- Add to cart, adjust quantities
- Stock validation (can't oversell)
- Customer name input
- Confirm & save sale (deducts stock automatically)

### ✅ Invoices & Reports
- Full sales history
- Per-sale invoice with items, total, profit
- Filter by today / month / all time
- Share invoice text via share sheet
- Profit tracking (admin only)

### ✅ Staff Management (Admin only)
- Add staff members with username & password
- Toggle "can view buying price" permission
- Remove staff access instantly

---

## 🚀 Setup & Installation

### Prerequisites
- [Node.js 18+](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go app](https://expo.dev/client) on your phone (iOS or Android)

### Steps

```bash
# 1. Unzip the downloaded file
cd AshaCycleStore

# 2. Install dependencies
npm install

# 3. Start the development server
npx expo start

# 4. Scan the QR code with Expo Go on your phone
```

### Build for Production (APK/IPA)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

---

## 🏗️ Project Structure

```
AshaCycleStore/
├── App.js                    # Entry point
├── app.json                  # Expo config
├── package.json              # Dependencies
├── assets/                   # Icons, images
└── src/
    ├── context/
    │   └── AppContext.js     # Global state, all data logic
    ├── navigation/
    │   └── AppNavigator.js   # Stack + Tab navigation
    ├── screens/
    │   ├── LoginScreen.js
    │   ├── DashboardScreen.js
    │   ├── InventoryScreen.js
    │   ├── NewSaleScreen.js
    │   ├── ScannerScreen.js
    │   ├── BarcodeGeneratorScreen.js
    │   ├── InvoicesScreen.js
    │   └── StaffScreen.js
    ├── components/
    │   └── UI.js             # Reusable components
    └── utils/
        ├── theme.js          # Colors, sizes, fonts
        └── helpers.js        # Formatters, generators
```

---

## 💾 Data Storage

All data is stored locally on the device using **AsyncStorage**:
- Products, sales, users persist between app restarts
- No internet required after installation
- Data stays on the device (private & secure)

---

## 🎨 Design

- **Color scheme**: Deep navy blue + warm amber gold
- **Font sizes**: Extra large for comfortable reading by older users
- **Touch targets**: All buttons minimum 56px height
- **Language**: Simple, clear labels (no technical jargon)
- **Currency**: BDT (Bangladeshi Taka ৳)

---

## 📦 Sample Products (Pre-loaded)

| Product | Category | Selling Price | Stock |
|---------|----------|--------------|-------|
| Bicycle Chain | Chain & Drive | ৳200 | 25 |
| Inner Tube 26" | Tyres & Tubes | ৳150 | 40 |
| Brake Pad Set | Brakes | ৳120 | 30 |
| Gear Cable Set | Cables | ৳90 | 20 |
| Handlebar Grip Pair | Handlebar | ৳75 | 50 |

---

Made with ❤️ for Asha Cycle Store
