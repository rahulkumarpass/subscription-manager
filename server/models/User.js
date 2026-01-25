const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },

    // --- NEW: This stores the "Address" of the user's browser ---
    pushSubscriptions: [{
        endpoint: String,
        keys: {
            p256dh: String,
            auth: String
        }
    }]
    // ------------------------------------------------------------

}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);