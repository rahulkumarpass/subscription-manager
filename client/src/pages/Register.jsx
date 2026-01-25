import { useState, useContext, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle, Moon, Sun, UserPlus, ArrowRight } from "lucide-react";

const Register = () => {
    const [formData, setFormData] = useState({
        username: "", email: "", password: "", confirmPassword: ""
    });
    const [error, setError] = useState("");
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { username, email, password, confirmPassword } = formData;

        if (!username || !email || !password || !confirmPassword) { setError("All fields are required."); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
        if (password !== confirmPassword) { setError("Passwords do not match."); return; }

        try {
            const { data } = await axios.post("http://localhost:5000/api/auth/register", { username, email, password });
            login(data);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 font-sans">

            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[10%] right-[30%] w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-[10%] left-[20%] w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
            </div>

            <div className="glass w-full max-w-md p-8 rounded-3xl relative z-10 animate-slide-up border border-white/40 dark:border-gray-700/50">

                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-pink-600 rounded-lg text-white">
                                <UserPlus className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-xl text-gray-800 dark:text-white">Join Us</span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Create your digital account.</p>
                    </div>
                    <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600 transition shadow-sm">
                        {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
                    </button>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium animate-slide-up">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1 uppercase tracking-wider">Username</label>
                        <input type="text" name="username" className="input-digital" placeholder="johndoe" value={formData.username} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1 uppercase tracking-wider">Email</label>
                        <input type="email" name="email" className="input-digital" placeholder="john@example.com" value={formData.email} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1 uppercase tracking-wider">Password</label>
                        <input type="password" name="password" className="input-digital" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1 uppercase tracking-wider">Confirm Password</label>
                        <input type="password" name="confirmPassword" className="input-digital" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} />
                    </div>

                    <button type="submit" className="w-full mt-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-pink-500/30 transition-all duration-300 hover:shadow-pink-500/50 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 group">
                        Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Already have an account? <Link to="/login" className="text-pink-600 dark:text-pink-400 font-bold hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;