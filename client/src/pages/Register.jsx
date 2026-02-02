import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Mail, Lock, User, KeyRound, Timer, ArrowRight } from 'lucide-react';

const Register = () => {
    const [step, setStep] = useState('signup'); // 'signup' or 'otp'
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const [canResend, setCanResend] = useState(false);

    // 👇 CHANGED: Import 'setCredentials' instead of 'login'
    const { setCredentials } = useContext(AuthContext);
    const navigate = useNavigate();

    // Timer Logic
    useEffect(() => {
        let timer;
        if (step === 'otp' && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        } else if (timeLeft === 0) {
            setCanResend(true);
        }
        return () => clearInterval(timer);
    }, [step, timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/register', formData);
            setStep('otp');
            setTimeLeft(300);
            setCanResend(false);
            alert("OTP sent to your email!");
        } catch (error) {
            alert(error.response?.data?.message || "Signup failed");
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/verify-otp', {
                email: formData.email,
                otp
            });

            setCredentials(data);

            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Invalid OTP");
        }
    };

    const handleResend = async () => {
        try {
            await axios.post('http://localhost:5000/api/auth/resend-otp', { email: formData.email });
            setTimeLeft(300);
            setCanResend(false);
            alert("New OTP sent!");
        } catch (error) {
            alert("Failed to resend");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0f172a] p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">

                <h2 className="text-3xl font-extrabold text-center text-gray-800 dark:text-white mb-2">
                    {step === 'signup' ? 'Create Account' : 'Verify Email'}
                </h2>
                <p className="text-center text-gray-500 mb-6">
                    {step === 'signup' ? 'Start managing your subscriptions' : `Enter the code sent to ${formData.email}`}
                </p>

                {step === 'signup' ? (
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <input type="text" placeholder="User Name" className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none dark:text-white"
                                    value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <input type="email" placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none dark:text-white"
                                    value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none dark:text-white"
                                    value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/30">
                            Send OTP Code
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300 mb-2">Enter 6-Digit Code</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-3.5 h-5 w-5 text-indigo-500" />
                                <input type="text" maxLength="6" placeholder="123456" className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-2 border-indigo-500 text-center text-2xl tracking-[0.5em] font-bold dark:text-white"
                                    value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required />
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                            <div className={`flex items-center gap-1 font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-gray-500'}`}>
                                <Timer className="w-4 h-4" /> {formatTime(timeLeft)}
                            </div>
                            <button type="button" onClick={handleResend} disabled={!canResend} className={`font-bold ${canResend ? 'text-indigo-600 hover:underline cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}>
                                Resend Code
                            </button>
                        </div>

                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/30">
                            Verify & Create Account <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                )}

                <p className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm">
                    Already verified? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
};
export default Register;