const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    category: { type: String },

    billingCycle: { type: String, required: true },
    customDays: { type: Number }, // For "Custom" cycle
    startDate: { type: Date, required: true },
    nextPaymentDate: { type: Date, required: true },

    // --- NEW: ADVANCED REMINDER SETTINGS ---
    reminderSettings: {
        daysBefore: { type: Number, default: 3 }, // e.g., Start reminding 5 days before
        frequency: { type: Number, default: 1, max: 3 }, // 1, 2, or 3 times a day
        preferredTimes: [{ type: String }], // e.g., ["09:00", "18:00"] (24h format)
    }
    // ---------------------------------------

}, { timestamps: true });
module.exports = mongoose.model('Subscription', subscriptionSchema);