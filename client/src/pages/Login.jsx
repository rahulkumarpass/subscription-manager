import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Mail, Lock, RefreshCw, ShieldCheck } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaCode, setCaptchaCode] = useState('');

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const canvasRef = useRef(null);

    // 🎨 Custom Captcha Generator
    const generateCaptcha = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Generate Random Code
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptchaCode(code);

        // Draw Text with Noise
        ctx.font = 'bold 28px Courier New';
        ctx.fillStyle = '#4f46e5';
        ctx.setTransform(1, -0.1, 0.2, 1, 0, 0); // Slant/Skew
        ctx.fillText(code, 20, 35);
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset

        // Draw Noise Lines
        for (let i = 0; i < 7; i++) {
            ctx.strokeStyle = `rgba(100, 100, 100, 0.3)`;
            ctx.beginPath();
            ctx.moveTo(Math.random() * 140, Math.random() * 50);
            ctx.lineTo(Math.random() * 140, Math.random() * 50);
            ctx.stroke();
        }
    };

    useEffect(() => {
        generateCaptcha();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 🛡️ CAPTCHA CHECK
        if (captchaInput.toUpperCase() !== captchaCode) {
            alert("Captcha Incorrect! Please try again.");
            generateCaptcha();
            setCaptchaInput("");
            return;
        }

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (error) {
            alert(error.response?.data?.message || 'Invalid credentials');
            generateCaptcha(); // Refresh captcha on fail
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0f172a] p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl font-extrabold text-center text-gray-800 dark:text-white mb-2">Welcome Back</h2>
                <p className="text-center text-gray-500 mb-6">Login to continue managing subscriptions</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium dark:text-gray-300 mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <input type="email" placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none dark:text-white"
                                value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium dark:text-gray-300 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none dark:text-white"
                                value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                    </div>

                    {/* 🛡️ CAPTCHA BOX */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-3">
                            <canvas ref={canvasRef} width="140" height="50" className="rounded-md border border-gray-300 bg-white cursor-pointer" onClick={generateCaptcha} title="Click to Refresh"></canvas>
                            <button type="button" onClick={generateCaptcha} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500">
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-3.5 h-5 w-5 text-indigo-500" />
                            <input type="text" placeholder="Enter code from image" className="w-full pl-10 pr-4 py-3 rounded-lg bg-white dark:bg-black/20 border border-gray-300 dark:border-gray-600 uppercase tracking-widest font-bold dark:text-white"
                                value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} required />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/30">
                        Login
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm">
                    Don't have an account? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
};
export default Login;