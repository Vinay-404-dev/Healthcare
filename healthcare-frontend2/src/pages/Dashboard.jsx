import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Activity, Users, Calendar, FileText, Plus, Loader2, Trash2,
    LayoutDashboard, LogOut, Menu, X, Bell, Search, TrendingUp, Heart, Clock, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { healthAPI, patientsAPI, appointmentsAPI, recordsAPI } from '../services/api';

// ─── Sidebar ───────────────────────────────────────────────────────────────
function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, collapsed, setCollapsed }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
        { id: 'patients', icon: Users, label: 'Patients' },
        { id: 'appointments', icon: Calendar, label: 'Appointments' },
        { id: 'records', icon: FileText, label: 'Medical Records' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <aside className={`fixed top-0 left-0 h-full bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 z-30 transform transition-all duration-300
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
                ${collapsed ? 'w-16' : 'w-64'}`}>
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-6 border-b border-slate-700 min-h-[80px]">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <h1 className="text-white font-bold text-lg leading-none whitespace-nowrap">HealthCare</h1>
                            <p className="text-slate-400 text-xs whitespace-nowrap">Management System</p>
                        </div>
                    )}
                    {/* Collapse toggle — desktop only, top of sidebar */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-all flex-shrink-0 ${collapsed ? 'mx-auto' : 'ml-auto'}`}
                    >
                        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                    {/* Mobile close */}
                    <button className="lg:hidden text-slate-400 ml-auto" onClick={() => setSidebarOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* User */}
                <div className="px-3 py-4 border-b border-slate-700">
                    <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        {!collapsed && (
                            <div className="overflow-hidden">
                                <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
                                <p className="text-slate-400 text-xs truncate">{user?.email}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Nav */}
                <nav className="px-2 py-4 flex-1">
                    {!collapsed && <p className="text-slate-500 text-xs uppercase tracking-wider px-2 mb-3">Main Menu</p>}
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                            title={collapsed ? item.label : ''}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-all text-sm font-medium
                                ${collapsed ? 'justify-center' : ''}
                                ${activeTab === item.id
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && item.label}
                        </button>
                    ))}
                </nav>

                {/* Logout only at bottom */}
                <div className="px-2 pb-4">
                    <button
                        onClick={handleLogout}
                        title={collapsed ? 'Sign Out' : ''}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-medium ${collapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && 'Sign Out'}
                    </button>
                </div>
            </aside>
        </>
    );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, gradient }) {
    return (
        <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${color} bg-white/20 rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-white/60" />
            </div>
            <p className="text-white/70 text-sm font-medium">{label}</p>
            <p className="text-white text-3xl font-bold mt-1">{value}</p>
        </div>
    );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────
export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [systemStatus, setSystemStatus] = useState('checking');
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [patientForm, setPatientForm] = useState({ name: '', date_of_birth: '', email: '', phone: '', address: '', blood_group: '' });
    const [appointmentForm, setAppointmentForm] = useState({ patient_id: '', doctor_name: '', appointment_datetime: '', reason: '' });
    const [recordForm, setRecordForm] = useState({ patient_id: '', diagnosis: '', prescription: '', doctor_name: '', record_date: '' });

    useEffect(() => {
        const check = async () => {
            try { await healthAPI.checkHealth(); setSystemStatus('online'); }
            catch { setSystemStatus('offline'); }
        };
        check();
        const iv = setInterval(check, 30000);
        return () => clearInterval(iv);
    }, []);

    useEffect(() => {
        if (activeTab === 'overview' || activeTab === 'patients') loadPatients();
        if (activeTab === 'overview' || activeTab === 'appointments') loadAppointments();
        if (activeTab === 'records') loadRecords();
    }, [activeTab]);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const loadPatients = async () => {
        try {
            const r = await patientsAPI.getAll();
            setPatients(r.data.data || []);
        } catch { showMessage('error', 'Failed to load patients'); }
    };

    const loadAppointments = async () => {
        try {
            const r = await appointmentsAPI.getAll();
            setAppointments(r.data.data || []);
        } catch { showMessage('error', 'Failed to load appointments'); }
    };

    const loadRecords = async () => {
        setLoading(true);
        try {
            const pRes = await patientsAPI.getAll();
            const allPats = pRes.data.data || [];
            const all = [];
            for (const p of allPats) {
                try {
                    const rRes = await recordsAPI.getByPatient(p.id);
                    all.push(...rRes.data.data.map(r => ({ ...r, patientName: p.name })));
                } catch { }
            }
            setRecords(all);
            setPatients(allPats);
        } catch { showMessage('error', 'Failed to load records'); }
        setLoading(false);
    };

    const handlePatientSubmit = async (e) => {
        e.preventDefault();
        try {
            await patientsAPI.create(patientForm);
            showMessage('success', '✅ Patient added successfully!');
            setPatientForm({ name: '', date_of_birth: '', email: '', phone: '', address: '', blood_group: '' });
            loadPatients();
        } catch (err) { showMessage('error', '❌ ' + (err.response?.data?.error || err.message)); }
    };

    const handleAppointmentSubmit = async (e) => {
        e.preventDefault();
        try {
            const dt = new Date(appointmentForm.appointment_datetime).toISOString().slice(0, 19).replace('T', ' ');
            await appointmentsAPI.create({ ...appointmentForm, patient_id: parseInt(appointmentForm.patient_id), appointment_datetime: dt });
            showMessage('success', '✅ Appointment booked!');
            setAppointmentForm({ patient_id: '', doctor_name: '', appointment_datetime: '', reason: '' });
            loadAppointments();
        } catch (err) { showMessage('error', '❌ ' + (err.response?.data?.error || err.message)); }
    };

    const handleRecordSubmit = async (e) => {
        e.preventDefault();
        try {
            await recordsAPI.create({ ...recordForm, patient_id: parseInt(recordForm.patient_id) });
            showMessage('success', '✅ Record added!');
            setRecordForm({ patient_id: '', diagnosis: '', prescription: '', doctor_name: '', record_date: '' });
            loadRecords();
        } catch (err) { showMessage('error', '❌ ' + (err.response?.data?.error || err.message)); }
    };

    const handleDeletePatient = async (id, name) => {
        if (!window.confirm(`Delete patient "${name}"? All their appointments and records will also be deleted.`)) return;
        try {
            await patientsAPI.delete(id);
            showMessage('success', '✅ Patient deleted!');
            loadPatients();
        } catch (err) { showMessage('error', '❌ ' + (err.response?.data?.error || err.message)); }
    };

    const handleDeleteAppointment = async (id) => {
        if (!window.confirm(`Delete Appointment #${id}?`)) return;
        try {
            await appointmentsAPI.delete(id);
            showMessage('success', '✅ Appointment deleted!');
            loadAppointments();
        } catch (err) { showMessage('error', '❌ ' + (err.response?.data?.error || err.message)); }
    };

    const handleDeleteRecord = async (id) => {
        if (!window.confirm(`Delete Medical Record #${id}?`)) return;
        try {
            await recordsAPI.delete(id);
            showMessage('success', '✅ Record deleted!');
            loadRecords();
        } catch (err) { showMessage('error', '❌ ' + (err.response?.data?.error || err.message)); }
    };

    const inputCls = "w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring focus:ring-indigo-100 transition text-slate-800 placeholder-slate-400";
    const labelCls = "block text-sm font-semibold text-slate-700 mb-1.5";

    return (
        <div className="min-h-screen bg-slate-100 flex">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} collapsed={collapsed} setCollapsed={setCollapsed} />

            {/* Main content */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
                {/* Top bar */}
                <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-700">
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="relative flex-1 max-w-sm hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input className="pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="Search..." />
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${systemStatus === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            <div className={`w-2 h-2 rounded-full ${systemStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            {systemStatus === 'online' ? 'System Online' : 'System Offline'}
                        </div>
                        <button className="relative p-2 rounded-xl hover:bg-slate-100 transition">
                            <Bell className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6">
                    {/* Message */}
                    {message.text && (
                        <div className={`mb-6 px-5 py-3.5 rounded-xl text-sm font-medium shadow ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                            {message.text}
                        </div>
                    )}

                    {/* ── OVERVIEW ── */}
                    {activeTab === 'overview' && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
                                <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                                <StatCard icon={Users} label="Total Patients" value={patients.length} gradient="from-indigo-500 to-purple-600" color="bg-white/20" />
                                <StatCard icon={Calendar} label="Appointments" value={appointments.length} gradient="from-emerald-500 to-teal-600" color="bg-white/20" />
                                <StatCard icon={Heart} label="System Status" value={systemStatus === 'online' ? 'Healthy' : 'Offline'} gradient="from-rose-500 to-pink-600" color="bg-white/20" />
                            </div>

                            {/* Recent patients */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-slate-800">Recent Patients</h3>
                                    <button onClick={() => setActiveTab('patients')} className="text-indigo-600 text-sm font-semibold hover:underline">View All →</button>
                                </div>
                                {patients.length === 0 ? (
                                    <p className="text-slate-400 text-center py-8">No patients yet. Go to Patients tab to add one.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {patients.slice(0, 5).map(p => (
                                            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition">
                                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                    {p.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-slate-800 truncate">{p.name}</p>
                                                    <p className="text-slate-400 text-xs truncate">{p.email}</p>
                                                </div>
                                                {p.blood_group && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">{p.blood_group}</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── PATIENTS ── */}
                    {activeTab === 'patients' && (
                        <div>
                            <div className="mb-6"><h2 className="text-2xl font-bold text-slate-800">Patient Management</h2><p className="text-slate-500">Add and manage patient records</p></div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-600" /> Add New Patient</h3>
                                <form onSubmit={handlePatientSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div><label className={labelCls}>Full Name *</label><input type="text" required value={patientForm.name} onChange={e => setPatientForm({ ...patientForm, name: e.target.value })} className={inputCls} placeholder="Patient's full name" /></div>
                                        <div><label className={labelCls}>Date of Birth *</label><input type="date" required value={patientForm.date_of_birth} onChange={e => setPatientForm({ ...patientForm, date_of_birth: e.target.value })} className={inputCls} /></div>
                                        <div><label className={labelCls}>Email *</label><input type="email" required value={patientForm.email} onChange={e => setPatientForm({ ...patientForm, email: e.target.value })} className={inputCls} placeholder="example@email.com" /></div>
                                        <div><label className={labelCls}>Phone Number</label><input type="tel" value={patientForm.phone} onChange={e => setPatientForm({ ...patientForm, phone: e.target.value })} className={inputCls} placeholder="9876543210" /></div>
                                        <div>
                                            <label className={labelCls}>Blood Group</label>
                                            <select value={patientForm.blood_group} onChange={e => setPatientForm({ ...patientForm, blood_group: e.target.value })} className={inputCls}>
                                                <option value="">Select...</option>
                                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                        <div><label className={labelCls}>Address</label><input type="text" value={patientForm.address} onChange={e => setPatientForm({ ...patientForm, address: e.target.value })} className={inputCls} placeholder="Full address" /></div>
                                    </div>
                                    <button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow hover:shadow-lg">Add Patient</button>
                                </form>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h3 className="font-bold text-slate-800 mb-4">All Patients ({patients.length})</h3>
                                {patients.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400"><Users className="w-16 h-16 mx-auto mb-3 opacity-20" /><p>No patients yet. Add your first patient above!</p></div>
                                ) : (
                                    <div className="space-y-3">
                                        {patients.map(p => (
                                            <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">{p.name.charAt(0)}</div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-800">{p.name}</p>
                                                    <p className="text-slate-500 text-sm">{p.email} • {p.date_of_birth}</p>
                                                    {p.phone && <p className="text-slate-400 text-xs">{p.phone}</p>}
                                                </div>
                                                {p.blood_group && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">{p.blood_group}</span>}
                                                <button onClick={() => handleDeletePatient(p.id, p.name)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── APPOINTMENTS ── */}
                    {activeTab === 'appointments' && (
                        <div>
                            <div className="mb-6"><h2 className="text-2xl font-bold text-slate-800">Appointments</h2><p className="text-slate-500">Schedule and manage appointments</p></div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-600" /> Book New Appointment</h3>
                                <form onSubmit={handleAppointmentSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className={labelCls}>Select Patient *</label>
                                            <select required value={appointmentForm.patient_id} onChange={e => setAppointmentForm({ ...appointmentForm, patient_id: e.target.value })} className={inputCls}>
                                                <option value="">Choose patient...</option>
                                                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div><label className={labelCls}>Doctor's Name *</label><input type="text" required value={appointmentForm.doctor_name} onChange={e => setAppointmentForm({ ...appointmentForm, doctor_name: e.target.value })} className={inputCls} placeholder="Dr. Sharma" /></div>
                                        <div className="md:col-span-2"><label className={labelCls}>Appointment Date & Time *</label><input type="datetime-local" required value={appointmentForm.appointment_datetime} onChange={e => setAppointmentForm({ ...appointmentForm, appointment_datetime: e.target.value })} className={inputCls} /></div>
                                        <div className="md:col-span-2"><label className={labelCls}>Reason for Visit</label><textarea value={appointmentForm.reason} onChange={e => setAppointmentForm({ ...appointmentForm, reason: e.target.value })} className={inputCls} rows="2" placeholder="Describe the reason..." /></div>
                                    </div>
                                    <button type="submit" className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold px-8 py-3 rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all shadow hover:shadow-lg">Book Appointment</button>
                                </form>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                <h3 className="font-bold text-slate-800 mb-4">All Appointments ({appointments.length})</h3>
                                {appointments.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400"><Calendar className="w-16 h-16 mx-auto mb-3 opacity-20" /><p>No appointments yet.</p></div>
                                ) : (
                                    <div className="space-y-3">
                                        {appointments.map(apt => (
                                            <div key={apt.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <Clock className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-800">Appointment #{apt.id}</p>
                                                    <p className="text-slate-500 text-sm">👨‍⚕️ {apt.doctor_name} • {new Date(apt.appointment_datetime).toLocaleString('en-IN')}</p>
                                                    {apt.reason && <p className="text-slate-400 text-xs truncate">{apt.reason}</p>}
                                                </div>
                                                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${apt.status === 'scheduled' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>{apt.status}</span>
                                                <button onClick={() => handleDeleteAppointment(apt.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── RECORDS ── */}
                    {activeTab === 'records' && (
                        <div>
                            <div className="mb-6"><h2 className="text-2xl font-bold text-slate-800">Medical Records</h2><p className="text-slate-500">View and manage patient medical records</p></div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-600" /> Add Medical Record</h3>
                                <form onSubmit={handleRecordSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className={labelCls}>Select Patient *</label>
                                            <select required value={recordForm.patient_id} onChange={e => setRecordForm({ ...recordForm, patient_id: e.target.value })} className={inputCls}>
                                                <option value="">Choose patient...</option>
                                                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div><label className={labelCls}>Doctor's Name *</label><input type="text" required value={recordForm.doctor_name} onChange={e => setRecordForm({ ...recordForm, doctor_name: e.target.value })} className={inputCls} placeholder="Dr. Sharma" /></div>
                                        <div><label className={labelCls}>Record Date</label><input type="date" value={recordForm.record_date} onChange={e => setRecordForm({ ...recordForm, record_date: e.target.value })} className={inputCls} /></div>
                                        <div className="md:col-span-2"><label className={labelCls}>Diagnosis *</label><textarea required value={recordForm.diagnosis} onChange={e => setRecordForm({ ...recordForm, diagnosis: e.target.value })} className={inputCls} rows="2" /></div>
                                        <div className="md:col-span-2"><label className={labelCls}>Prescription</label><textarea value={recordForm.prescription} onChange={e => setRecordForm({ ...recordForm, prescription: e.target.value })} className={inputCls} rows="2" /></div>
                                    </div>
                                    <button type="submit" className="bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow hover:shadow-lg">Add Record</button>
                                </form>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                                    <h3 className="font-bold text-slate-800 mb-4">All Medical Records ({records.length})</h3>
                                    {records.length === 0 ? (
                                        <div className="text-center py-12 text-slate-400"><FileText className="w-16 h-16 mx-auto mb-3 opacity-20" /><p>No medical records yet.</p></div>
                                    ) : (
                                        <div className="space-y-3">
                                            {records.map(r => (
                                                <div key={r.id} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <FileText className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-slate-800">{r.patientName}</p>
                                                        <p className="text-slate-500 text-sm">👨‍⚕️ {r.doctor_name} • 📅 {r.record_date}</p>
                                                        <p className="text-slate-600 text-sm mt-1">🔍 <strong>Diagnosis:</strong> {r.diagnosis}</p>
                                                        {r.prescription && <p className="text-slate-500 text-xs mt-1">💊 {r.prescription}</p>}
                                                    </div>
                                                    <button onClick={() => handleDeleteRecord(r.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
