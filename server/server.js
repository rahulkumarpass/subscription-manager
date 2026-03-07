require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const subRoutes = require('./routes/subRoutes');
const checkDueBills = require('./jobs/checkDueBills');
const notifRoutes = require('./routes/notifRoutes');

// 🛡️ 1. IMPORT SECURITY GUARDS
const helmet = require('helmet');

connectDB();
const app = express();

// --- Middleware ---
app.use(express.json());
app.use(cors());

// 🛡️ 2. ACTIVATE SECURITY GUARDS
app.use(helmet()); // Secures your HTTP headers (Mongoose naturally handles NoSQL injections)

// Cron Jobs
checkDueBills();

// Basic Route to test server
app.get('/', (req, res) => {
    res.send('API is running...');
});

// --- Routes ---
app.use('/api/notifications', notifRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});