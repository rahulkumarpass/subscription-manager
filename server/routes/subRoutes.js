const express = require('express');
const router = express.Router();
const {
    getSubscriptions,
    addSubscription,
    deleteSubscription,
    updateSubscription // <--- IMPORT THIS
} = require('../controllers/subController');

const { protect } = require('../middleware/authMiddleware');

// Get all & Add new
router.route('/')
    .get(protect, getSubscriptions)
    .post(protect, addSubscription);

// Delete & Update (Edit)
router.route('/:id')
    .delete(protect, deleteSubscription)
    .put(protect, updateSubscription); // <--- ADD THIS LINE

module.exports = router;