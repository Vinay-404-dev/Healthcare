import { useState, useEffect } from 'react';
import { Activity, Users, Calendar, FileText, Plus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { healthAPI, patientsAPI, appointmentsAPI, recordsAPI } from './services/api';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('patients');
  const [systemStatus, setSystemStatus] = useState('checking');
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [patientForm, setPatientForm] = useState({
    name: '',
    date_of_birth: '',
    email: '',
    phone: '',
    address: '',
    blood_group: ''
  });

  const [appointmentForm, setAppointmentForm] = useState({
    patient_id: '',
    doctor_name: '',
    appointment_datetime: '',
    reason: ''
  });

  const [recordForm, setRecordForm] = useState({
    patient_id: '',
    diagnosis: '',
    prescription: '',
    doctor_name: '',
    record_date: ''
  });

  // Check system health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await healthAPI.checkHealth();
        setSystemStatus('online');
      } catch (error) {
        setSystemStatus('offline');
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'patients') loadPatients();
    if (activeTab === 'appointments') loadAppointments();
    if (activeTab === 'records') loadRecords();
  }, [activeTab]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const response = await patientsAPI.getAll();
      setPatients(response.data.data || []);
    } catch (error) {
      showMessage('error', 'Error loading patients');
    }
    setLoading(false);
  };

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const response = await appointmentsAPI.getAll();
      setAppointments(response.data.data || []);
      await loadPatients(); // To populate dropdown
    } catch (error) {
      showMessage('error', 'Error loading appointments');
    }
    setLoading(false);
  };

  const loadRecords = async () => {
    setLoading(true);
    try {
      const patientRes = await patientsAPI.getAll();
      const allPatients = patientRes.data.data || [];

      const allRecords = [];
      for (const patient of allPatients) {
        try {
          const recordsRes = await recordsAPI.getByPatient(patient.id);
          const patientRecords = recordsRes.data.data.map(r => ({
            ...r,
            patientName: patient.name
          }));
          allRecords.push(...patientRecords);
        } catch (err) {
          // Patient might have no records
        }
      }
      setRecords(allRecords);
      setPatients(allPatients); // For dropdown
    } catch (error) {
      showMessage('error', 'Error loading records');
    }
    setLoading(false);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    try {
      await patientsAPI.create(patientForm);
      showMessage('success', '✅ Patient successfully added!');
      setPatientForm({ name: '', date_of_birth: '', email: '', phone: '', address: '', blood_group: '' });
      loadPatients();
    } catch (error) {
      showMessage('error', '❌ Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const datetime = new Date(appointmentForm.appointment_datetime).toISOString().slice(0, 19).replace('T', ' ');
      await appointmentsAPI.create({
        ...appointmentForm,
        patient_id: parseInt(appointmentForm.patient_id),
        appointment_datetime: datetime
      });
      showMessage('success', '✅ Appointment successfully booked!');
      setAppointmentForm({ patient_id: '', doctor_name: '', appointment_datetime: '', reason: '' });
      loadAppointments();
    } catch (error) {
      showMessage('error', '❌ Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    try {
      await recordsAPI.create({
        ...recordForm,
        patient_id: parseInt(recordForm.patient_id)
      });
      showMessage('success', '✅ Medical record successfully added!');
      setRecordForm({ patient_id: '', diagnosis: '', prescription: '', doctor_name: '', record_date: '' });
      loadRecords();
    } catch (error) {
      showMessage('error', '❌ Error: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-center mb-2">
            🏥 Healthcare Management System
          </h1>
          <p className="text-gray-600 text-center text-lg">
            आसानी से Patients, Appointments और Medical Records manage करें
          </p>
        </div>

        {/* Status Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">System Status</p>
              <div className="flex items-center justify-center gap-2">
                <div className={`w-3 h-3 rounded-full ${systemStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-xl font-bold text-indigo-600">
                  {systemStatus === 'online' ? 'Online' : systemStatus === 'offline' ? 'Offline' : 'Checking...'}
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Total Patients</p>
              <p className="text-3xl font-bold text-indigo-600">{patients.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Appointments</p>
              <p className="text-3xl font-bold text-indigo-600">{appointments.length}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setActiveTab('patients')}
            className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 p-4 rounded-xl font-semibold text-lg transition-all ${activeTab === 'patients'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-white text-indigo-600 hover:bg-indigo-50'
              }`}
          >
            <Users className="w-5 h-5" />
            Patients
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 p-4 rounded-xl font-semibold text-lg transition-all ${activeTab === 'appointments'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-white text-indigo-600 hover:bg-indigo-50'
              }`}
          >
            <Calendar className="w-5 h-5" />
            Appointments
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 p-4 rounded-xl font-semibold text-lg transition-all ${activeTab === 'records'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-white text-indigo-600 hover:bg-indigo-50'
              }`}
          >
            <FileText className="w-5 h-5" />
            Medical Records
          </button>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 'bg-red-100 text-red-800 border-l-4 border-red-500'
            }`}>
            {message.text}
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Plus className="w-6 h-6" />
              नया Patient Add करें
            </h2>
            <form onSubmit={handlePatientSubmit} className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">नाम (Name) *</label>
                  <input
                    type="text"
                    required
                    value={patientForm.name}
                    onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition"
                    placeholder="मरीज का नाम"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">जन्म तिथि *</label>
                  <input
                    type="date"
                    required
                    value={patientForm.date_of_birth}
                    onChange={(e) => setPatientForm({ ...patientForm, date_of_birth: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={patientForm.email}
                    onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition"
                    placeholder="example@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">फोन नंबर</label>
                  <input
                    type="tel"
                    value={patientForm.phone}
                    onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition"
                    placeholder="9876543210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group</label>
                  <select
                    value={patientForm.blood_group}
                    onChange={(e) => setPatientForm({ ...patientForm, blood_group: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition"
                  >
                    <option value="">Select...</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">पता</label>
                  <textarea
                    value={patientForm.address}
                    onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition"
                    rows="3"
                    placeholder="पूरा पता"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                Patient Add करें
              </button>
            </form>

            {/* Patients List */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 सभी Patients</h2>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : patients.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>अभी तक कोई patient नहीं है। ऊपर form से पहला patient add करें!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {patients.map(patient => (
                  <div key={patient.id} className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl shadow-md hover:shadow-lg transition-all">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      {patient.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {patient.date_of_birth}
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        {patient.email}
                      </div>
                      {patient.phone && (
                        <div>{patient.phone}</div>
                      )}
                      {patient.blood_group && (
                        <div className="flex items-center gap-2">
                          🩸 {patient.blood_group}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              नई Appointment Book करें
            </h2>
            <form onSubmit={handleAppointmentSubmit} className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Patient चुनें *</label>
                  <select
                    required
                    value={appointmentForm.patient_id}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, patient_id: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition"
                  >
                    <option value="">Select patient...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Doctor का नाम *</label>
                  <input
                    type="text"
                    required
                    value={appointmentForm.doctor_name}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, doctor_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition"
                    placeholder="Dr. Sharma"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={appointmentForm.appointment_datetime}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, appointment_datetime: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reason</label>
                  <textarea
                    value={appointmentForm.reason}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, reason: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition"
                    rows="3"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                Appointment Book करें
              </button>
            </form>

            {/* Appointments List */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📅 सभी Appointments</h2>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>कोई appointment नहीं है। ऊपर form से appointment book करें!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map(apt => (
                  <div key={apt.id} className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">📅 Appointment #{apt.id}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                      <div>👨‍⚕️ {apt.doctor_name}</div>
                      <div>🕐 {new Date(apt.appointment_datetime).toLocaleString('hi-IN')}</div>
                      <div>📊 Status: {apt.status}</div>
                      {apt.reason && <div className="md:col-span-2">📝 {apt.reason}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Records Tab */}
        {activeTab === 'records' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              नया Medical Record Add करें
            </h2>
            <form onSubmit={handleRecordSubmit} className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Patient चुनें *</label>
                  <select
                    required
                    value={recordForm.patient_id}
                    onChange={(e) => setRecordForm({ ...recordForm, patient_id: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition"
                  >
                    <option value="">Select patient...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Doctor का नाम *</label>
                  <input
                    type="text"
                    required
                    value={recordForm.doctor_name}
                    onChange={(e) => setRecordForm({ ...recordForm, doctor_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition"
                    placeholder="Dr. Sharma"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Diagnosis *</label>
                  <textarea
                    required
                    value={recordForm.diagnosis}
                    onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition"
                    rows="3"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prescription</label>
                  <textarea
                    value={recordForm.prescription}
                    onChange={(e) => setRecordForm({ ...recordForm, prescription: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Record Date</label>
                  <input
                    type="date"
                    value={recordForm.record_date}
                    onChange={(e) => setRecordForm({ ...recordForm, record_date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                Record Add करें
              </button>
            </form>

            {/* Records List */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 सभी Medical Records</h2>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>कोई medical record नहीं है। ऊपर form से record add करें!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map(record => (
                  <div key={record.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">📋 {record.patientName} - Medical Record</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div>👨‍⚕️ <strong>Doctor:</strong> {record.doctor_name}</div>
                      <div>📅 <strong>Date:</strong> {record.record_date}</div>
                      <div>🔍 <strong>Diagnosis:</strong> {record.diagnosis}</div>
                      {record.prescription && (
                        <div>💊 <strong>Prescription:</strong> {record.prescription}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
