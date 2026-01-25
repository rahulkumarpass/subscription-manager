import { useState, useContext, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Moon, Sun, CreditCard, ArrowRight } from "lucide-react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // Theme State
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post("http://localhost:5000/api/auth/login", { email, password });
            login(data);
            navigate("/dashboard");
        } catch (error) {
            alert("Invalid Credentials");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 font-sans">

            {/* --- ANIMATED BACKGROUND --- */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[20%] left-[20%] w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-[20%] right-[20%] w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* --- GLASS CARD --- */}
            <div className="glass w-full max-w-md p-8 rounded-3xl relative z-10 animate-slide-up border border-white/40 dark:border-gray-700/50">

                {/* Header Section */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-indigo-600 rounded-lg text-white">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-xl text-gray-800 dark:text-white">SubManager</span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Welcome back! Please login.</p>
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600 transition shadow-sm"
                    >
                        {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1 uppercase tracking-wider">Email Address</label>
                        <input
                            type="email"
                            className="input-digital"
                            placeholder="you@example.com"
                            value={email} onChange={(e) => setEmail(e.target.value)} required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1 uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            className="input-digital"
                            placeholder="••••••••"
                            value={password} onChange={(e) => setPassword(e.target.value)} required
                        />
                    </div>

                    <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:shadow-indigo-500/50 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 group">
                        Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Don't have an account? <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Create Account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;