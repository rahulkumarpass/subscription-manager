const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { registerUser, loginUser, verifyOTP, resendOTP } = require('../controllers/authController');

// 🛡️ SECURITY: OTP Rate Limiter (5 requests per hour, per IP)
const otpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 Hour window
    max: 5, // Limit each IP to 5 requests per window
    message: {
        message: 'Too many OTP requests from this IP. Please try again after an hour.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the limiter ONLY to routes that send emails
router.post('/register', otpLimiter, registerUser);
router.post('/resend-otp', otpLimiter, resendOTP);

// Normal routes (No strict limits)
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);

module.exports = router;