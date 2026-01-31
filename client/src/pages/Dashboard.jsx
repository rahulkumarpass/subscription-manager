import { useEffect, useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import { Trash2, Plus, Calendar, Moon, Sun, Bell, Pencil, X, Tag, Eye, CheckCircle, Mail, Linkedin, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [subs, setSubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

    // Modal States
    const [editingSub, setEditingSub] = useState(null);
    const [viewingSub, setViewingSub] = useState(null);
    const [customCategory, setCustomCategory] = useState("");

    const categories = ["Entertainment", "Personal", "Work", "Utilities", "Education", "Health & Fitness", "Food & Dining", "Shopping", "Transport", "Other"];

    useEffect(() => {
        if (darkMode) { document.documentElement.classList.add('dark'); localStorage.setItem("theme", "dark"); }
        else { document.documentElement.classList.remove('dark'); localStorage.setItem("theme", "light"); }
    }, [darkMode]);

    const fetchSubs = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get("http://localhost:5000/api/subscriptions", config);
            const sortedData = data.sort((a, b) => new Date(a.nextPaymentDate) - new Date(b.nextPaymentDate));
            setSubs(sortedData);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    useEffect(() => { if (user) fetchSubs(); }, [user]);

    const openEditModal = (sub) => {
        setEditingSub(sub);
        if (!categories.includes(sub.category)) setCustomCategory(sub.category);
        else setCustomCategory("");
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        // 🛡️ LOGIC GUARD: Prevent Start Date from being after Next Payment Date
        if (new Date(editingSub.startDate) > new Date(editingSub.nextPaymentDate)) {
            alert("Logic Error: The Start Date cannot be AFTER the Next Payment date.");
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            let finalCategory = editingSub.category === "Other" ? customCategory : editingSub.category;
            const payload = { ...editingSub, category: finalCategory, startDate: editingSub.startDate, nextPaymentDate: editingSub.nextPaymentDate };
            await axios.put(`http://localhost:5000/api/subscriptions/${editingSub._id}`, payload, config);
            setEditingSub(null); fetchSubs();
        } catch (error) { alert("Update failed"); }
    };

    const sendTestAlert = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/notifications/test', {}, config);
            alert("Sent! Check your device notifications.");
        } catch (error) { alert("Failed. Did you 'Enable Alerts' first?"); }
    };

    const handleMarkPaid = async (sub) => {
        const currentDue = new Date(sub.nextPaymentDate);
        let newDate = new Date(currentDue);
        if (sub.billingCycle === 'Monthly') newDate.setMonth(newDate.getMonth() + 1);
        else if (sub.billingCycle === 'Yearly') newDate.setFullYear(newDate.getFullYear() + 1);
        else if (sub.billingCycle === 'Weekly') newDate.setDate(newDate.getDate() + 7);
        else { const days = parseInt(sub.billingCycle); if (!isNaN(days)) newDate.setDate(newDate.getDate() + days); }

        if (!window.confirm(`Mark ${sub.name} as Paid? Next due date: ${newDate.toDateString()}`)) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`http://localhost:5000/api/subscriptions/${sub._id}`, { ...sub, nextPaymentDate: newDate }, config);
            fetchSubs();
        } catch (error) { alert("Error updating subscription"); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this subscription?")) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`http://localhost:5000/api/subscriptions/${id}`, config);
                setSubs(subs.filter((sub) => sub._id !== id));
            } catch (error) { alert("Error deleting"); }
        }
    };

    const publicVapidKey = 'BA19u_muixCKT_o0sRVXC7Uo5mjEHFbVpi-LBq6JAxZ8wU9J3h9_o2pZHTZ6YdRVuElFpBakqvV9Kuwoz8yAStw';
    const subscribeToPush = async () => {
        if ('serviceWorker' in navigator) {
            try {
                const register = await navigator.serviceWorker.register('/sw.js');
                const subscription = await register.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicVapidKey) });
                await axios.post('http://localhost:5000/api/notifications/subscribe', subscription, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` } });
                alert("Notifications Enabled!");
            } catch (error) { console.error("Push Error:", error); }
        } else { alert("Push notifications not supported."); }
    };
    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
        return outputArray;
    }

    const totalCost = subs.reduce((acc, sub) => acc + sub.price, 0);

    // ✨ ANIMATION VARIANTS
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const modalVariants = { hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }, exit: { opacity: 0, scale: 0.8 } };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#0f172a] transition-colors duration-500 font-sans flex flex-col">

            <nav className="glass sticky top-0 z-50 mb-8 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
                    <div><h1 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 leading-none">SubManager</h1><p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">Welcome, {user?.name || "User"} 👋</p></div>
                    <div className="flex gap-4">
                        <motion.button whileTap={{ scale: 0.9 }} onClick={sendTestAlert} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-bold text-xs hover:bg-purple-100 transition-colors"><Rocket className="w-4 h-4" /> Demo Alert</motion.button>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={subscribeToPush} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs"><Bell className="w-4 h-4" /> Alerts</motion.button>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">{darkMode ? <Sun className="w-5 h-5 text-yellow-400 fill-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-600 fill-indigo-600" />}</motion.button>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={logout} className="text-red-500 font-bold">Logout</motion.button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 pb-10 flex-grow w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 rounded-2xl flex flex-col justify-center"><p className="text-gray-500 font-medium">Monthly Cost</p><p className="text-5xl font-black text-gray-800 dark:text-white">₹{totalCost}</p></motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-6 rounded-2xl flex flex-col justify-center"><p className="text-gray-500 font-medium">Active Subs</p><p className="text-5xl font-black text-gray-800 dark:text-white">{subs.length}</p></motion.div>
                    <Link to="/add">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="glass h-full rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 group cursor-pointer">
                            <Plus className="w-8 h-8 text-indigo-500" /><span className="font-bold text-gray-500 mt-2">Add New</span>
                        </motion.div>
                    </Link>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 pl-1 border-l-4 border-indigo-500">Your Subscriptions</h2>

                {loading ? <p>Loading...</p> : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        <AnimatePresence>
                            {subs.map((sub) => {
                                const due = new Date(sub.nextPaymentDate);
                                const today = new Date(); due.setHours(0, 0, 0, 0); today.setHours(0, 0, 0, 0);
                                const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
                                const isOverdue = diff < 0; const isDueToday = diff === 0; const showPaidButton = isOverdue || isDueToday;
                                let cardStyle = "glass border-transparent"; let statusColor = "text-green-500"; let statusText = "Days Left";

                                if (isOverdue) { cardStyle = "bg-red-50 dark:bg-red-900/10 border-2 border-red-500"; statusColor = "text-red-600 dark:text-red-400"; statusText = "OVERDUE"; }
                                else if (isDueToday) { cardStyle = "bg-orange-50 dark:bg-orange-900/10 border-2 border-orange-500"; statusColor = "text-orange-600 dark:text-orange-400"; statusText = "DUE TODAY"; }

                                return (
                                    <motion.div
                                        layout
                                        variants={itemVariants}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        whileHover={{ y: -5, boxShadow: "0px 10px 30px rgba(0,0,0,0.1)" }}
                                        key={sub._id}
                                        className={`${cardStyle} rounded-2xl p-6 transition-colors duration-300 group relative shadow-lg`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">{sub.name.charAt(0).toUpperCase()}</div>
                                            <div className="text-right"><p className="text-2xl font-black text-gray-800 dark:text-white">₹{sub.price}</p><span className="text-[10px] font-bold uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md">{sub.billingCycle}</span></div>
                                        </div>
                                        <div className="mb-4"><h3 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">{sub.name}</h3><div className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 mt-1"><Tag className="w-3 h-3" /> {sub.category}</div></div>
                                        <div className="mb-6 p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-gray-100 dark:border-gray-700/50 flex justify-between items-center"><span className="text-xs font-bold text-gray-500 uppercase">{statusText}</span><span className={`text-sm font-black ${statusColor}`}>{diff < 0 ? `${Math.abs(diff)} Days Ago` : diff === 0 ? "Pay Now" : `${diff} Days`}</span></div>
                                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700/50 flex justify-between items-center">
                                            {showPaidButton ? (
                                                <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleMarkPaid(sub)} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md"><CheckCircle className="w-4 h-4" /> Mark Paid</motion.button>
                                            ) : (
                                                <div className="flex flex-col"><span className="text-[10px] text-gray-400 font-bold uppercase">Next Bill</span><div className="flex items-center text-gray-600 dark:text-gray-300 text-sm font-bold"><Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />{new Date(sub.nextPaymentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div></div>
                                            )}
                                            <div className="flex gap-1">
                                                <motion.button whileTap={{ scale: 0.8 }} onClick={() => setViewingSub(sub)} className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg"><Eye className="w-4 h-4" /></motion.button>
                                                <motion.button whileTap={{ scale: 0.8 }} onClick={() => openEditModal(sub)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg"><Pencil className="w-4 h-4" /></motion.button>
                                                <motion.button whileTap={{ scale: 0.8 }} onClick={() => handleDelete(sub._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>

            <footer className="mt-12 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm pt-8 pb-8 text-center"><p className="text-gray-500 dark:text-gray-400 mb-4 font-medium">© {new Date().getFullYear()} SubManager. All rights reserved.</p><div className="flex justify-center gap-6 text-sm"><a href="mailto:uic.24MCA20233@gmail.com" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"><Mail className="w-4 h-4" /> Contact Support</a><a href="https://www.linkedin.com/in/rahulkumar24mca/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"><Linkedin className="w-4 h-4" /> Rahul Kumar</a></div></footer>

            <AnimatePresence>
                {viewingSub && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="bg-white dark:bg-gray-900 rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-800"><h2 className="text-xl font-bold dark:text-white">{viewingSub.name}</h2><button onClick={() => setViewingSub(null)}><X className="w-6 h-6 text-gray-500" /></button></div>
                            <div className="space-y-4 dark:text-gray-300">
                                <p className="flex justify-between"><span>Price:</span> <span className="font-bold">₹{viewingSub.price}</span></p>
                                <p className="flex justify-between"><span>Cycle:</span> <span className="font-bold">{viewingSub.billingCycle}</span></p>
                                <p className="flex justify-between"><span>Start Date:</span> <span className="font-bold">{new Date(viewingSub.startDate).toLocaleDateString()}</span></p>
                                <p className="flex justify-between"><span>Next Due:</span> <span className="font-bold">{new Date(viewingSub.nextPaymentDate).toLocaleDateString()}</span></p>
                                {viewingSub.reminderSettings && (<p className="flex justify-between text-sm text-gray-500 pt-2"><span>Notification:</span> <span>{viewingSub.reminderSettings.daysBefore} days before</span></p>)}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {editingSub && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="bg-white dark:bg-gray-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Subscription</h2><button onClick={() => setEditingSub(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><X className="w-6 h-6 text-gray-500" /></button></div>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div><label className="block text-sm font-medium dark:text-gray-300">Name</label><input type="text" value={editingSub.name} onChange={(e) => setEditingSub({ ...editingSub, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none dark:text-white" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium dark:text-gray-300">Price</label><input type="number" value={editingSub.price} onChange={(e) => setEditingSub({ ...editingSub, price: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none dark:text-white" /></div>
                                    <div><label className="block text-sm font-medium dark:text-gray-300">Category</label><select value={categories.includes(editingSub.category) ? editingSub.category : "Other"} onChange={(e) => setEditingSub({ ...editingSub, category: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none dark:text-white">{categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}</select></div>
                                </div>
                                {(editingSub.category === "Other" || !categories.includes(editingSub.category)) && (<div><label className="block text-sm font-medium dark:text-gray-300">Custom Category Name</label><input type="text" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder="e.g. Gaming" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none dark:text-white border-2 border-indigo-500" required /></div>)}
                                <div><label className="block text-sm font-medium dark:text-gray-300">Original Start Date (Records Only)</label><input type="date" value={editingSub.startDate ? new Date(editingSub.startDate).toISOString().split('T')[0] : ''} onChange={(e) => setEditingSub({ ...editingSub, startDate: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none dark:text-white text-gray-500" /></div>
                                <div><label className="block text-sm font-medium dark:text-gray-300">Next Due Date (Controls Status)</label><input type="date" value={editingSub.nextPaymentDate ? new Date(editingSub.nextPaymentDate).toISOString().split('T')[0] : ''} onChange={(e) => setEditingSub({ ...editingSub, nextPaymentDate: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none dark:text-white border-l-4 border-indigo-500" /></div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div><label className="block text-sm font-medium dark:text-gray-300">Alert Time</label><input type="time" value={editingSub.reminderSettings?.preferredTimes?.[0] || "09:00"} onChange={(e) => setEditingSub({ ...editingSub, reminderSettings: { ...editingSub.reminderSettings, preferredTimes: [e.target.value] } })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none dark:text-white" /></div>
                                    <div><label className="block text-sm font-medium dark:text-gray-300">Days Before</label><input type="number" value={editingSub.reminderSettings?.daysBefore || 3} onChange={(e) => setEditingSub({ ...editingSub, reminderSettings: { ...editingSub.reminderSettings, daysBefore: e.target.value } })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none dark:text-white" /></div>
                                </div>
                                <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full py-3.5 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg">Save Changes</motion.button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
export default Dashboard;