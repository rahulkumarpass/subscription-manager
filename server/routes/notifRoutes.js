const express = require('express');
const router = express.Router();
// Import both functions from the controller
const { subscribeUser, sendTestNotification } = require('../controllers/notifController');
const { protect } = require('../middleware/authMiddleware');

// Route to save subscription keys
router.post('/subscribe', protect, subscribeUser);

// Route to trigger a test alert immediately
router.post('/test', protect, sendTestNotification);

module.exports = router;