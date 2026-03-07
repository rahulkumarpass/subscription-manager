import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, KeyRound, ArrowRight } from 'lucide-react';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setStep(2);
            alert("Reset code sent to your email!");
        } catch (error) {
            alert(error.response?.data?.message || "Failed to send reset code.");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/reset-password', { email, otp, newPassword });
            alert("Password reset successful! Please log in.");
            navigate('/login');
        } catch (error) {
            alert(error.response?.data?.message || "Invalid OTP or error resetting password.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0f172a] p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl font-extrabold text-center text-gray-800 dark:text-white mb-2">Reset Password</h2>
                <p className="text-center text-gray-500 mb-6">
                    {step === 1 ? "Enter your email to receive a reset code." : "Enter the code and your new password."}
                </p>

                {step === 1 ? (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <input type="email" placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none dark:text-white"
                                    value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/30">
                            Send Reset Code
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300 mb-1">6-Digit OTP</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-3.5 h-5 w-5 text-indigo-500" />
                                <input type="text" maxLength="6" placeholder="123456" className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-2 border-indigo-500 text-center text-2xl tracking-[0.5em] font-bold dark:text-white"
                                    value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300 mb-1">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none dark:text-white"
                                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/30">
                            Save New Password <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                )}

                <p className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm">
                    Remembered your password? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Back to Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;