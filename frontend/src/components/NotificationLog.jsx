import React, { useState, useEffect } from 'react';
import { History, RefreshCw, Send, Clock, XCircle, Search, Filter } from 'lucide-react';
import api from '../api';

const NotificationLog = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const filteredNotifications = notifications.filter(n => {
        const matchesSearch =
            n.message.toLowerCase().includes(search.toLowerCase()) ||
            (n.patient && n.patient.contact.includes(search));
        const matchesStatus = statusFilter === 'All' || n.status === statusFilter;
        const matchesType = typeFilter === 'All' || n.notification_type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    const stats = {
        total: notifications.length,
        sent: notifications.filter(n => n.status === 'Sent').length,
        pending: notifications.filter(n => n.status === 'Pending').length,
        failed: notifications.filter(n => n.status === 'Failed').length
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Sent': return <CheckCircle size={14} className="text-emerald-500 mr-1.5" />;
            case 'Pending': return <Clock size={14} className="text-amber-500 mr-1.5" />;
            case 'Failed': return <XCircle size={14} className="text-red-500 mr-1.5" />;
            default: return <CheckCircle flex-shrink-0 size={14} className="text-slate-400 mr-1.5" />;
        }
    };

    // Add CheckCircle here since it's used in the helper
    const CheckCircle = ({ size, className, flexShrink }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${className} ${flexShrink ? 'flex-shrink-0' : ''}`}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    )

    const getTypeColor = (type) => {
        switch (type) {
            case 'Emergency Alert': return 'bg-red-100 text-red-700 border-red-200';
            case 'Status Update': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Reminder': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Appointment Reschedule': return 'bg-pink-100 text-pink-700 border-pink-200';
            case 'Confirmation': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Stats Overview */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-center mb-6 z-10">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center tracking-tight">
                        <History size={24} className="mr-3 text-blue-600" />
                        Notification History
                    </h3>
                    <button
                        onClick={fetchNotifications}
                        className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
                        title="Refresh Data"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 z-10">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col shadow-sm">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total</span>
                        <span className="text-3xl font-black text-slate-800">{stats.total}</span>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex flex-col shadow-sm">
                        <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Sent</span>
                        <span className="text-3xl font-black text-emerald-700">{stats.sent}</span>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex flex-col shadow-sm">
                        <span className="text-[11px] font-bold text-amber-600 uppercase tracking-widest mb-1">Pending</span>
                        <span className="text-3xl font-black text-amber-700">{stats.pending}</span>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex flex-col shadow-sm">
                        <span className="text-[11px] font-bold text-red-600 uppercase tracking-widest mb-1">Failed</span>
                        <span className="text-3xl font-black text-red-700">{stats.failed}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">Search</label>
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search message or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all text-slate-800 placeholder:text-slate-400 font-medium"
                        />
                    </div>
                </div>

                <div className="w-full sm:w-48">
                    <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">Status</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all text-slate-800 font-medium"
                    >
                        <option value="All">All</option>
                        <option value="Sent">Sent</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                    </select>
                </div>

                <div className="w-full sm:w-48">
                    <label className="block text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">Type</label>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition-all text-slate-800 font-medium"
                    >
                        <option value="All">All</option>
                        <option value="Status Update">Status Update</option>
                        <option value="Reminder">Reminder</option>
                        <option value="Confirmation">Confirmation</option>
                        <option value="Appointment Reschedule">Appointment Reschedule</option>
                        <option value="Emergency Alert">Emergency Alert</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
                        <Filter size={32} className="mx-auto text-slate-300 mb-3" />
                        <p className="font-medium">No notifications found matching your criteria.</p>
                    </div>
                ) : (
                    filteredNotifications.map((notif) => (
                        <div key={notif.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-md border ${notif.status === 'Sent' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : notif.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                        {getStatusIcon(notif.status)}
                                        {notif.status}
                                    </span>
                                    <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full border ${getTypeColor(notif.notification_type)}`}>
                                        {notif.notification_type}
                                    </span>
                                </div>
                            </div>

                            <p className="text-slate-800 font-medium text-[15px] leading-relaxed mb-4">
                                {notif.message}
                            </p>

                            <div className="flex flex-wrap items-center text-[13px] text-slate-500 font-medium gap-x-6 gap-y-2 pt-4 border-t border-slate-100">
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                    <span className="text-slate-700">{notif.patient?.contact || 'Unknown Number'}</span>
                                </div>
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    <span className="text-slate-700">Patient #{notif.patient_id}</span>
                                </div>
                                {notif.appointment_id && (
                                    <div className="flex items-center text-blue-600">
                                        <svg className="w-4 h-4 mr-1.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                                        Appointment #{notif.appointment_id}
                                    </div>
                                )}
                                <div className="flex items-center ml-auto">
                                    <span className="text-slate-400">
                                        {new Date(notif.sent_at).toLocaleDateString()} {status === 'Sent' ? '✓ Sent:' : ''} {new Date(notif.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationLog;
