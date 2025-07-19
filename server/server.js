const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

//const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

//app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(()=> {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server is running on port ${process.env.PORT || 5000}`);
    })
})
.catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
})