// Format currency in BDT (Taka)
export const formatCurrency = (amount) => {
  return '৳ ' + Number(amount).toLocaleString('en-BD');
};

export const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-BD', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export const formatDateTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-BD', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// Generate a random EAN-13 like barcode string
export const generateBarcode = () => {
  const digits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
  // Checksum
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return digits + check;
};

// Generate invoice HTML for printing
export const generateInvoiceHTML = (sale) => {
  const rows = sale.items.map(item => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;">${item.name}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:center;">${item.qty}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">৳${item.sellingPrice}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">৳${item.sellingPrice * item.qty}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8"/>
      <style>
        body { font-family: 'Helvetica', sans-serif; margin: 0; padding: 20px; color: #1a1a2e; }
        .header { text-align: center; margin-bottom: 24px; border-bottom: 3px solid #1a3a5c; padding-bottom: 16px; }
        .header h1 { color: #1a3a5c; font-size: 26px; margin: 0; }
        .header p { color: #666; margin: 4px 0; font-size: 13px; }
        .invoice-meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; }
        thead { background: #1a3a5c; color: white; }
        th { padding: 12px 8px; text-align: left; font-size: 14px; }
        th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: center; }
        th:last-child { text-align: right; }
        td { font-size: 14px; color: #333; }
        .totals { margin-top: 16px; text-align: right; }
        .totals table { width: auto; margin-left: auto; }
        .totals td { padding: 6px 12px; font-size: 15px; }
        .grand-total { font-size: 18px; font-weight: bold; color: #1a3a5c; }
        .footer { margin-top: 32px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🚲 Asha Cycle Store</h1>
        <p>Your trusted motor parts & cycle shop</p>
        <p>Phone: 01700-000000 | Dhaka, Bangladesh</p>
      </div>
      <div class="invoice-meta">
        <div><strong>Invoice No:</strong> ${sale.invoiceNo}</div>
        <div><strong>Date:</strong> ${formatDateTime(sale.createdAt)}</div>
      </div>
      <div class="invoice-meta">
        <div><strong>Customer:</strong> ${sale.customerName}</div>
        <div><strong>Served by:</strong> ${sale.soldBy || 'Staff'}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Item</th><th style="text-align:center">Qty</th><th style="text-align:center">Price</th><th style="text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="totals">
        <table>
          <tr><td>Subtotal</td><td class="grand-total">৳${sale.total}</td></tr>
        </table>
      </div>
      <div class="footer">
        <p>Thank you for shopping at Asha Cycle Store!</p>
        <p>Returns accepted within 7 days with receipt.</p>
      </div>
    </body>
    </html>
  `;
};
