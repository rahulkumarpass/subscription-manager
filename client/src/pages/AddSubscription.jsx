import { useState, useContext, useEffect } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sun, Moon, CalendarDays, Bell } from "lucide-react";

const AddSub = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Date Helpers
    const todayDateObj = new Date();
    const todayISO = todayDateObj.toISOString().split("T")[0];
    const todayReadable = todayDateObj.toDateString();

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

    // Form State
    const [formData, setFormData] = useState({
        name: "", price: "", category: "Entertainment", billingCycle: "Monthly",
        startDate: todayISO, reminderDaysBefore: 3, reminderFrequency: 1,
    });

    const [reminderTimes, setReminderTimes] = useState(["09:00"]);
    const [customCategory, setCustomCategory] = useState("");
    const [periodType, setPeriodType] = useState("Monthly");
    const [customDays, setCustomDays] = useState(28);
    const [calculations, setCalculations] = useState({ nextDate: "", isoDate: "", totalDays: 0 });

    // --- FIX: Press Enter to Jump to Next Input ---
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const form = e.target.form;
            const index = Array.prototype.indexOf.call(form, e.target);
            if (form.elements[index + 1]) {
                form.elements[index + 1].focus();
            }
        }
    };

    const handleFrequencyChange = (e) => {
        const freq = parseInt(e.target.value);
        setFormData({ ...formData, reminderFrequency: freq });
        const defaults = ["09:00", "14:00", "20:00"];
        setReminderTimes(defaults.slice(0, freq));
    };

    const handleTimeChange = (index, value) => {
        const newTimes = [...reminderTimes];
        newTimes[index] = value;
        setReminderTimes(newTimes);
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // --- AUTOMATIC DUE DATE CALCULATION ---
    useEffect(() => {
        if (!formData.startDate) return;
        const start = new Date(formData.startDate);
        const next = new Date(start);

        switch (periodType) {
            case "Monthly":
                next.setMonth(next.getMonth() + 1);
                if (next.getDate() !== start.getDate()) next.setDate(0);
                break;
            case "Yearly": next.setFullYear(next.getFullYear() + 1); break;
            case "28 Days": next.setDate(next.getDate() + 28); break;
            case "30 Days": next.setDate(next.getDate() + 30); break;
            case "Quarterly": next.setDate(next.getDate() + 90); break;
            case "Custom":
                const add = parseInt(customDays) || 0;
                next.setDate(next.getDate() + add);
                break;
            default: break;
        }

        const diffTime = Math.abs(next - start);
        const exactDaysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        setCalculations({
            nextDate: next.toDateString(),
            isoDate: next.toISOString(),
            totalDays: exactDaysDiff
        });
    }, [formData.startDate, periodType, customDays]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalCategory = formData.category === "Other" ? customCategory : formData.category;
        const submissionData = {
            ...formData, category: finalCategory,
            billingCycle: periodType === "Custom" ? `${customDays} Days` : periodType,
            customDays: periodType === "Custom" ? customDays : null,
            nextPaymentDate: calculations.isoDate, reminderTimes
        };

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post("http://localhost:5000/api/subscriptions", submissionData, config);
            navigate("/dashboard");
        } catch (error) {
            alert("Error adding subscription");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 font-sans">
            {/* Background Animation */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[10%] right-[10%] w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-[10%] left-[10%] w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="glass w-full max-w-lg p-8 rounded-3xl relative z-10 animate-slide-up">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <button onClick={() => navigate("/dashboard")} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-500 dark:text-gray-300">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white ml-4 tracking-tight">Add Subscription</h2>
                    </div>
                    <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600 transition shadow-sm">
                        {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1 uppercase tracking-wider">Service Name</label>
                        <input type="text" name="name" required className="input-digital" placeholder="e.g. Netflix" value={formData.name} onChange={handleChange} onKeyDown={handleKeyDown} />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1 uppercase tracking-wider">Price (INR)</label>
                            <input type="number" name="price" required className="input-digital" placeholder="0.00" value={formData.price} onChange={handleChange} onKeyDown={handleKeyDown} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1 uppercase tracking-wider">Start Date</label>
                            <input type="date" name="startDate" max={todayISO} required className="input-digital" value={formData.startDate} onChange={handleChange} onKeyDown={handleKeyDown} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1 uppercase tracking-wider">Billing Cycle</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Monthly', '28 Days', '30 Days', 'Quarterly', 'Yearly', 'Custom'].map((type) => (
                                <button key={type} type="button" onClick={() => setPeriodType(type)}
                                    className={`py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${periodType === type ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                                    {type}
                                </button>
                            ))}
                        </div>
                        {periodType === "Custom" && (
                            <div className="mt-3 animate-slide-up">
                                <input type="number" value={customDays} onChange={(e) => setCustomDays(e.target.value)} className="input-digital" placeholder="Enter days" onKeyDown={handleKeyDown} />
                            </div>
                        )}
                    </div>

                    {/* --- CLEAR DUE DATE PREVIEW --- */}
                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-2xl flex items-start gap-4 border border-indigo-100 dark:border-indigo-500/20 backdrop-blur-sm">
                        <div className="bg-white dark:bg-indigo-500/20 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400 shadow-sm mt-1">
                            <CalendarDays className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-1">Next Payment Due</p>
                            <div className="flex justify-between items-center">
                                <p className="text-gray-800 dark:text-white font-black text-lg">{calculations.nextDate}</p>
                                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg font-bold">
                                    {calculations.totalDays} Days
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">Today: {todayReadable}</p>
                        </div>
                    </div>

                    {/* Reminder Settings */}
                    <div className="bg-gray-50/50 dark:bg-gray-800/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/30">
                        <div className="flex items-center gap-2.5 mb-4">
                            <Bell className="w-5 h-5 text-indigo-500" />
                            <h3 className="font-bold text-sm text-gray-700 dark:text-gray-200">Notifications</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase">Alert Before</label>
                                <div className="relative">
                                    <input type="number" min="1" max="30" className="input-digital" value={formData.reminderDaysBefore} onChange={handleChange} name="reminderDaysBefore" onKeyDown={handleKeyDown} />
                                    <span className="absolute right-4 top-3.5 text-xs text-gray-400 font-bold">Days</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase">Frequency</label>
                                <select name="reminderFrequency" className="input-digital appearance-none" value={formData.reminderFrequency} onChange={handleFrequencyChange} onKeyDown={handleKeyDown}>
                                    <option value="1">1 Time / Day</option>
                                    <option value="2">2 Times / Day</option>
                                    <option value="3">3 Times / Day</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">Preferred Time(s)</label>
                            <div className="flex gap-2">
                                {reminderTimes.map((time, index) => (
                                    <input key={index} type="time" value={time} onChange={(e) => handleTimeChange(index, e.target.value)} className="input-digital text-center font-bold text-gray-600 dark:text-gray-300" onKeyDown={handleKeyDown} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1 uppercase tracking-wider">Category</label>
                        <select name="category" className="input-digital appearance-none" value={formData.category} onChange={handleChange} onKeyDown={handleKeyDown}>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Health">Health</option>
                            <option value="Work">Work</option>
                            <option value="Education">Education</option>
                            <option value="Groceries">Groceries</option>
                            <option value="Insurance">Insurance</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    {formData.category === "Other" && (
                        <input type="text" placeholder="Specify Category..." required className="input-digital animate-slide-up" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} onKeyDown={handleKeyDown} />
                    )}

                    <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:shadow-indigo-500/50 hover:-translate-y-1 active:scale-95">
                        Save Subscription
                    </button>
                </form>
            </div>
        </div>
    );
};
export default AddSub;