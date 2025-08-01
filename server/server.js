const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const clientRoutes = require('./routes/clientRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');


const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

connectDB();

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the SimpleBill API');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.listen(5000, () => {
  console.log('Server running on port 5000');
});