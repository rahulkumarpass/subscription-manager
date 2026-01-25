require('dotenv').config();
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const subRoutes = require('./routes/subRoutes');
const checkDueBills = require('./jobs/checkDueBills');
const notifRoutes = require('./routes/notifRoutes');

// Load config
dotenv.config();

// Connect to Database
connectDB();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
checkDueBills();
app.use('/api/notifications', notifRoutes);

// Basic Route to test server
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Routes
app.use('/api/auth', authRoutes); // 2. THIS WAS MISSING - It activates the routes
app.use('/api/subscriptions', subRoutes);
// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});