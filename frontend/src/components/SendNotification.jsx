import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api';

const SendNotification = ({ patients, defaultPatientId, onSuccess }) => {
    const [formData, setFormData] = useState({
        patient_id: defaultPatientId || '',
        notification_type: 'Status Update',
        message: ''
    });

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: null, text: '' });

    // Update form if default patient ID changes from outside (e.g. PatientCard click)
    useEffect(() => {
        if (defaultPatientId) {
            setFormData(prev => ({ ...prev, patient_id: defaultPatientId }));
        }
    }, [defaultPatientId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.patient_id) {
            setStatus({ type: 'error', text: 'Please select a patient.' });
            return;
        }

        setLoading(true);
        setStatus({ type: null, text: '' });

        try {
            await api.post('/notifications', {
                patient_id: parseInt(formData.patient_id),
                notification_type: formData.notification_type,
                message: formData.message,
                status: 'Sent'
            });

            setStatus({ type: 'success', text: 'Notification sent successfully!' });
            setFormData({ patient_id: '', notification_type: 'Status Update', message: '' });

            if (onSuccess) onSuccess();

        } catch (error) {
            console.error("Failed to send notification:", error);
            setStatus({ type: 'error', text: 'Failed to send notification. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm transition-all shadow-xl max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-6 text-slate-900 border-b border-slate-100 pb-4 flex items-center">
                <Send size={24} className="mr-3 text-purple-600" />
                Notification Manager
            </h3>

            {status.text && (
                <div className={`p-4 rounded-xl flex items-start text-sm font-medium mb-6 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {status.type === 'success' ? <CheckCircle className="mr-2.5 mt-0.5 shrink-0" size={18} /> : <AlertCircle className="mr-2.5 mt-0.5 shrink-0" size={18} />}
                    <span className="leading-snug">{status.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-[11px] font-bold tracking-widest text-slate-500 uppercase mb-2">Select Patient</label>
                    <select
                        name="patient_id"
                        value={formData.patient_id}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white transition-all outline-none font-medium text-slate-800 appearance-none"
                    >
                        <option value="">Choose a patient...</option>
                        {patients.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name} (ID: #{p.id}) - {p.appointments && p.appointments.length > 0 ? `${p.appointments[0].triage_level}: ${p.appointments[0].symptoms.substring(0, 30)}${p.appointments[0].symptoms.length > 30 ? '...' : ''}` : '(No Recent Admissions)'}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[11px] font-bold tracking-widest text-slate-500 uppercase mb-2">Notification Type</label>
                    <select
                        name="notification_type"
                        value={formData.notification_type}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white transition-all outline-none font-medium text-slate-800 appearance-none"
                    >
                        <option value="Status Update">Status Update</option>
                        <option value="Reminder">Reminder</option>
                        <option value="Confirmation">Confirmation</option>
                        <option value="Appointment Reschedule">Appointment Reschedule</option>
                        <option value="Emergency Alert">Emergency Alert</option>
                    </select>
                </div>

                <div>
                    <label className="block text-[11px] font-bold tracking-widest text-slate-500 uppercase mb-2">Message</label>
                    <textarea
                        name="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        maxLength={160}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white transition-all outline-none font-medium text-slate-800 resize-none placeholder:text-slate-400 placeholder:font-normal"
                        placeholder="Enter notification message..."
                    ></textarea>
                    <div className="text-right flex items-center justify-between text-xs font-semibold text-slate-400 mt-1.5 px-1">
                        <span>{formData.message.length}/160 characters</span>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading || formData.message.length === 0}
                        className="w-full py-4 px-6 bg-[#9300ea] hover:bg-[#7b00c3] disabled:opacity-60 disabled:hover:scale-100 disabled:bg-slate-300 disabled:text-slate-500 active:scale-[0.98] text-white rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center"
                    >
                        {loading ? (
                            <><Loader2 size={20} className="animate-spin mr-3" /> Sending...</>
                        ) : (
                            <><Send size={20} className="mr-2" /> Send Notification</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SendNotification;
