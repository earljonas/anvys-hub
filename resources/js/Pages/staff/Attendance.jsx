import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import StaffLayout from '@/Layouts/StaffLayout';
import { Clock, AlertCircle, MapPin, History, X } from 'lucide-react';
import { format, parseISO, intervalToDuration } from 'date-fns';

// PIN Modal Component
const PinModal = ({ isOpen, onClose, onSubmit, action, processing, error }) => {
    const [pin, setPin] = useState('');

    useEffect(() => {
        if (isOpen) {
            setPin('');
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(pin);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 fade-in duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${action === 'clockIn'
                        ? 'bg-gradient-to-br from-pink-500 to-pink-600'
                        : 'bg-gradient-to-br from-red-500 to-red-600'
                        }`}>
                        <Clock className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {action === 'clockIn' ? 'Clock In' : 'Clock Out'}
                    </h2>
                    <p className="text-gray-500 mt-2">
                        Enter your 4-digit PIN to confirm
                    </p>
                </div>

                {/* PIN Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            pattern="[0-9]*"
                            placeholder="••••"
                            value={pin}
                            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            autoFocus
                            className="w-full text-center text-4xl font-mono tracking-[0.5em] py-4 px-4 rounded-2xl bg-gray-100 border-2 border-gray-200 text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        />
                        {error && (
                            <div className="mt-3 text-red-500 text-sm font-medium flex items-center justify-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={pin.length !== 4 || processing}
                        className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${action === 'clockIn'
                            ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700'
                            : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                            }`}
                    >
                        {processing ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            `Confirm ${action === 'clockIn' ? 'Clock In' : 'Clock Out'}`
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

const Attendance = ({ history }) => {
    const { flash, auth } = usePage().props;
    const user = auth?.user;
    const employee = user?.employee;

    // Get employee status from user's attendance status (passed from backend)
    const [employeeStatus, setEmployeeStatus] = useState('idle');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    // PIN Modal State
    const [pinModalOpen, setPinModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState(null); // 'clockIn' or 'clockOut'

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Safe date formatter helpers
    const formatDateSafely = (dateString, formatStr) => {
        if (!dateString) return '-';
        try {
            return format(parseISO(dateString), formatStr);
        } catch {
            return '-';
        }
    };

    const formatTimeSafely = (dateString, formatStr) => {
        if (!dateString) return '-';
        try {
            return format(parseISO(dateString), formatStr);
        } catch {
            return '-';
        }
    };

    // Determine employee status based on today's latest attendance record
    useEffect(() => {
        if (history) {
            const records = history.data || history;
            const today = new Date();

            // Filter records for today and find the latest one
            const todayRecords = records.filter(record => {
                if (!record.clock_in) return false;
                try {
                    const recordDate = parseISO(record.clock_in);
                    return recordDate.toDateString() === today.toDateString();
                } catch {
                    return false;
                }
            });

            // Get the latest record (records are already sorted by clock_in desc from backend)
            const latestTodayRecord = todayRecords.length > 0 ? todayRecords[0] : null;

            if (latestTodayRecord) {
                if (latestTodayRecord.clock_out) {
                    setEmployeeStatus('done');
                } else {
                    setEmployeeStatus('active');
                }
            } else {
                setEmployeeStatus('idle');
            }
        }
    }, [history]);

    // Update status from flash messages
    useEffect(() => {
        if (flash?.status) {
            setEmployeeStatus(flash.status);
        }
    }, [flash]);

    const openPinModal = (action) => {
        setPendingAction(action);
        setPinModalOpen(true);
    };

    const closePinModal = () => {
        setPinModalOpen(false);
        setPendingAction(null);
        setErrors({});
    };

    const handlePinSubmit = (pin) => {
        // Capture action before async operations to avoid closure issues
        const action = pendingAction;

        const route_name = action === 'clockIn'
            ? route('staff.attendance.clockIn')
            : route('staff.attendance.clockOut');

        setProcessing(true);
        setErrors({});

        router.post(route_name, { pin }, {
            preserveScroll: true,
            onSuccess: () => {
                // Close modal on success
                setPinModalOpen(false);
                setPendingAction(null);
                setErrors({});

                // Update status based on action taken
                if (action === 'clockIn') {
                    setEmployeeStatus('active');
                } else {
                    setEmployeeStatus('done');
                }
            },
            onError: (newErrors) => {
                setErrors(newErrors);
                // Keep modal open to show error
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    // Helper for Hours Worked
    const getHoursWorked = (record) => {
        if (record.total_hours) return `${record.total_hours} hrs`;
        if (record.clock_out && record.clock_in) {
            const start = parseISO(record.clock_in);
            const end = parseISO(record.clock_out);
            const duration = intervalToDuration({ start, end });
            return `${duration.hours || 0}h ${duration.minutes || 0}m`;
        }
        return '-';
    };

    // History is already scoped to current user from the backend
    const userHistory = history?.data || history || [];

    return (
        <StaffLayout>
            <Head title="Attendance" />

            <div className="max-w-6xl mx-auto space-y-8 p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">


                {/* Pink Clock Card */}
                <div className="bg-gradient-to-br from-pink-500 to-pink-400 rounded-3xl shadow-xl p-8 md:p-12 text-center text-white relative overflow-hidden">
                    {/* Decorative Circles */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500 opacity-10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col items-center justify-center space-y-6">

                        {/* Clock Display */}
                        <div>
                            <div className="text-6xl md:text-8xl font-bold tracking-tight font-mono tabular-nums leading-none drop-shadow-lg">
                                {format(currentTime, 'h:mm:ss a')}
                            </div>
                            <div className="text-pink-100 mt-2 text-lg font-medium opacity-90">
                                {format(currentTime, 'EEEE, MMMM do, yyyy')}
                            </div>
                        </div>

                        {/* Status Pill */}
                        <div>
                            {employeeStatus === 'active' ? (
                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 text-white font-bold shadow-sm animate-pulse">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                    Currently Working
                                </span>
                            ) : employeeStatus === 'done' ? (
                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/30 text-white font-bold backdrop-blur-sm border border-white/20">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    Shift Completed
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white font-bold backdrop-blur-sm border border-white/20">
                                    <div className="w-2 h-2 bg-pink-200 rounded-full"></div>
                                    Ready to Clock In
                                </span>
                            )}
                        </div>

                        {/* Next Assignment Display */}
                        {employee?.next_shift && (
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-sm border border-white/10 text-pink-50 mt-2">
                                <MapPin size={14} className="text-pink-200" />
                                <span>Next: <strong>{employee.next_shift.location}</strong> @ {employee.next_shift.start}</span>
                            </div>
                        )}

                        {/* Error Message */}
                        {errors.message && (
                            <div className="bg-red-100/90 text-red-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm">
                                <AlertCircle size={16} />
                                {errors.message}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap justify-center gap-4 mt-8 w-full max-w-md">
                            {employeeStatus !== 'active' && (
                                <button
                                    onClick={() => openPinModal('clockIn')}
                                    disabled={employeeStatus !== 'idle' || processing}
                                    className={`
                                        flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg
                                        ${employeeStatus !== 'idle'
                                            ? 'bg-pink-600/50 text-pink-200 cursor-not-allowed opacity-70'
                                            : 'bg-white text-pink-600 hover:bg-pink-50 cursor-pointer'}
                                    `}
                                >
                                    <Clock className="w-5 h-5" />
                                    Clock In
                                </button>
                            )}

                            {employeeStatus === 'active' && (
                                <button
                                    onClick={() => openPinModal('clockOut')}
                                    disabled={employeeStatus !== 'active' || processing}
                                    className={`
                                        flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg border-2
                                        ${employeeStatus !== 'active'
                                            ? 'bg-transparent border-red-300/30 text-pink-200 cursor-not-allowed opacity-50'
                                            : 'bg-red-600 border-red-600 text-white hover:bg-red-700 cursor-pointer'}
                                    `}
                                >
                                    <Clock className="w-5 h-5" />
                                    Clock Out
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* History Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                        <History className="text-orange-500" size={20} />
                        <h2 className="font-bold text-gray-800">Your Attendance History</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100 uppercase tracking-wider text-xs text-gray-500 font-bold">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Time In</th>
                                    <th className="px-6 py-4">Time Out</th>
                                    <th className="px-6 py-4">Hours Worked</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {userHistory.length > 0 ? userHistory.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-800">
                                            {formatDateSafely(record.clock_in, 'EEE, MMM d')}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            {formatTimeSafely(record.clock_in, 'h:mm a')}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            {record.clock_out ? formatTimeSafely(record.clock_out, 'h:mm a') : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {getHoursWorked(record)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className={`
                                                    inline-flex px-3 py-1 rounded-full text-xs font-bold
                                                    ${!record.clock_out ? 'bg-blue-100 text-blue-700' : ''}
                                                    ${record.clock_out && record.status === 'approved' ? 'bg-green-100 text-green-700' : ''}
                                                    ${record.clock_out && record.status === 'pending' ? 'bg-orange-100 text-orange-700' : ''}
                                                    ${record.status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
                                                `}>
                                                    {!record.clock_out ? 'Working' : (record.status === 'approved' ? 'Confirmed' : record.status)}
                                                </span>
                                                {!!record.is_edited && (
                                                    <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200" title="Edited by Admin">
                                                        EDITED
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                            No attendance history found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* PIN Modal */}
            <PinModal
                isOpen={pinModalOpen}
                onClose={closePinModal}
                onSubmit={handlePinSubmit}
                action={pendingAction}
                processing={processing}
                error={errors.pin || errors.message}
            />
        </StaffLayout>
    );
};

export default Attendance;