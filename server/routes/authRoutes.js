const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { registerUser, loginUser, verifyOTP, resendOTP, forgotPassword, resetPassword } = require('../controllers/authController');

// 🛡️ SECURITY: OTP Rate Limiter (5 requests per hour, per IP)
const otpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { message: 'Too many requests from this IP. Please try again after an hour.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply the limiter to routes that send emails
router.post('/register', otpLimiter, registerUser);
router.post('/resend-otp', otpLimiter, resendOTP);
router.post('/forgot-password', otpLimiter, forgotPassword); // 🆕 Added

// Normal routes 
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword); // 🆕 Added

module.exports = router;