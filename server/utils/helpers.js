const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Generate secure random string
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Format currency
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Calculate invoice totals
const calculateInvoiceTotals = (items, taxRate = 0, discountType = 'percentage', discountValue = 0) => {
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.rate;
    return sum + itemTotal;
  }, 0);

  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = (subtotal * discountValue) / 100;
  } else {
    discountAmount = discountValue;
  }

  const afterDiscount = subtotal - discountAmount;
  const taxAmount = (afterDiscount * taxRate) / 100;
  const total = afterDiscount + taxAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100
  };
};

// Email transporter setup
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Send invoice email
const sendInvoiceEmail = async (invoice, client, user) => {
  try {
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: `"${user.company?.name || user.name}" <${process.env.FROM_EMAIL}>`,
      to: client.email,
      subject: `Invoice ${invoice.invoiceNumber} from ${user.company?.name || user.name}`,
      html: generateInvoiceEmailTemplate(invoice, client, user)
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Generate invoice email template
const generateInvoiceEmailTemplate = (invoice, client, user) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { background-color: #3B82F6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .invoice-details { margin: 20px 0; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; font-size: 18px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Invoice ${invoice.invoiceNumber}</h1>
            <p>From: ${user.company?.name || user.name}</p>
        </div>
        
        <div class="content">
            <div class="invoice-details">
                <p><strong>Bill To:</strong><br>
                ${client.name}<br>
                ${client.company ? client.company + '<br>' : ''}
                ${client.email}</p>
                
                <p><strong>Invoice Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>

            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.items.map(item => `
                        <tr>
                            <td>${item.description}</td>
                            <td>${item.quantity}</td>
                            <td>${formatCurrency(item.rate)}</td>
                            <td>${formatCurrency(item.amount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="total">
                <p>Subtotal: ${formatCurrency(invoice.subtotal)}</p>
                ${invoice.discount.amount > 0 ? `<p>Discount: -${formatCurrency(invoice.discount.amount)}</p>` : ''}
                ${invoice.tax.amount > 0 ? `<p>Tax: ${formatCurrency(invoice.tax.amount)}</p>` : ''}
                <p style="font-size: 20px; color: #3B82F6;">Total: ${formatCurrency(invoice.total)}</p>
            </div>

            ${invoice.notes ? `<div class="footer"><p><strong>Notes:</strong><br>${invoice.notes}</p></div>` : ''}
        </div>
    </body>
    </html>
  `;
};

// Date utilities
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const isOverdue = (dueDate) => {
  return new Date() > new Date(dueDate);
};

module.exports = {
  generateSecureToken,
  formatCurrency,
  calculateInvoiceTotals,
  sendInvoiceEmail,
  generateInvoiceEmailTemplate,
  addDays,
  isOverdue
};