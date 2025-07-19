const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

connectDB();

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the SimpleBill API');
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});