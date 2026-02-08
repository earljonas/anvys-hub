import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import StaffLayout from '@/Layouts/StaffLayout';
import { Clock, AlertCircle, MapPin, User, History } from 'lucide-react';
import { format, parseISO, intervalToDuration } from 'date-fns';

const Attendance = ({ employees, history }) => {
    const { flash } = usePage().props;

    // Kiosk Logic
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        pin: '',
    });

    // 1. On Mount: Check LocalStorage first
    useEffect(() => {
        const savedId = localStorage.getItem('kiosk_selected_id');
        if (savedId) {
            setSelectedEmployeeId(savedId);
            setData('user_id', savedId);
        }
    }, []);

    // 2. Also listen to backend Flash data
    useEffect(() => {
        if (flash?.last_clocked_id) {
            setSelectedEmployeeId(flash.last_clocked_id);
            localStorage.setItem('kiosk_selected_id', flash.last_clocked_id);
            setData('user_id', flash.last_clocked_id);
        }
    }, [flash]);

    // Helper to find status of selected user
    const selectedEmployeeStats = employees.find(e => e.id == selectedEmployeeId);
    const employeeStatus = selectedEmployeeStats ? selectedEmployeeStats.status : 'idle'; // idle, active, done

    // Function to handle selection change
    const handleEmployeeChange = (e) => {
        const newId = e.target.value;
        setSelectedEmployeeId(newId);
        localStorage.setItem('kiosk_selected_id', newId);
        setData('user_id', newId);
    };

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleClockIn = () => {
        if (!selectedEmployeeId) return alert('Please select your name first.');
        post(route('staff.attendance.clockIn'), {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setData('pin', ''), // Clear PIN after action
        });
    };

    const handleClockOut = () => {
        if (!selectedEmployeeId) return alert('Please select your name first.');
        post(route('staff.attendance.clockOut'), {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setData('pin', ''), // Clear PIN after action
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

    return (
        <StaffLayout>
            <Head title="Attendance" />

            <div className="max-w-6xl mx-auto space-y-8 p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
                    <div className="text-gray-500">
                        {format(currentTime, 'EEEE, MMMM do, yyyy')}
                    </div>
                </div>

                {/* Profile Selector */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
                    <User className="text-purple-500" />
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Select Your Profile
                        </label>
                        <select
                            value={selectedEmployeeId}
                            onChange={handleEmployeeChange}
                            className="block w-full border-none text-lg font-medium text-gray-800 focus:ring-0 p-0 cursor-pointer"
                        >
                            <option value="" disabled>-- Choose Name --</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

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

                        {/* Next Assignment Display (Preserved Feature) */}
                        {selectedEmployeeId && selectedEmployeeStats?.next_shift && (
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-sm border border-white/10 text-pink-50 mt-2">
                                <MapPin size={14} className="text-pink-200" />
                                <span>Next: <strong>{selectedEmployeeStats.next_shift.location}</strong> @ {selectedEmployeeStats.next_shift.start}</span>
                            </div>
                        )}

                        {/* PIN Input - Show for both clock-in and clock-out */}
                        {selectedEmployeeId && (employeeStatus === 'idle' || employeeStatus === 'active') && (
                            <div className="w-full max-w-xs">
                                <label className="block text-pink-100 text-sm font-medium mb-2">
                                    Enter Your 4-Digit PIN to {employeeStatus === 'idle' ? 'Clock In' : 'Clock Out'}
                                </label>
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={4}
                                    pattern="[0-9]*"
                                    placeholder="••••"
                                    value={data.pin}
                                    onChange={e => setData('pin', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    className="w-full text-center text-2xl font-mono tracking-[0.5em] py-3 px-4 rounded-xl bg-white/20 border border-white/30 text-white placeholder-pink-200/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                                />
                                {errors.pin && (
                                    <div className="mt-2 text-red-200 text-sm font-medium flex items-center justify-center gap-1">
                                        <AlertCircle size={14} />
                                        {errors.pin}
                                    </div>
                                )}
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
                            {(!selectedEmployeeId || employeeStatus !== 'active') && (
                                <button
                                    onClick={handleClockIn}
                                    disabled={!selectedEmployeeId || employeeStatus !== 'idle' || processing}
                                    className={`
                                        flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg
                                        ${!selectedEmployeeId || employeeStatus !== 'idle'
                                            ? 'bg-pink-600/50 text-pink-200 cursor-not-allowed opacity-70'
                                            : 'bg-white text-pink-600 hover:bg-pink-50 cursor-pointer'}
                                    `}
                                >
                                    <Clock className="w-5 h-5" />
                                    Clock In
                                </button>
                            )}

                            {selectedEmployeeId && employeeStatus === 'active' && (
                                <button
                                    onClick={handleClockOut}
                                    disabled={!selectedEmployeeId || employeeStatus !== 'active' || processing}
                                    className={`
                                        flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg border-2
                                        ${!selectedEmployeeId || employeeStatus !== 'active'
                                            ? 'bg-transparent border-pink-300/30 text-pink-200 cursor-not-allowed opacity-50'
                                            : 'bg-gray-900 border-gray-900 text-white hover:bg-gray-800 cursor-pointer'}
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
                        {selectedEmployeeId && employees.find(e => e.id == selectedEmployeeId) && (
                            <span className="text-sm text-gray-500 ml-auto">
                                Showing records for: <span className="font-medium text-gray-800">{employees.find(e => e.id == selectedEmployeeId).name}</span>
                            </span>
                        )}
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
                                {history.filter(record => !selectedEmployeeId || record.user_id == selectedEmployeeId).length > 0 ? history
                                    .filter(record => !selectedEmployeeId || record.user_id == selectedEmployeeId)
                                    .map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-800">
                                                {format(parseISO(record.clock_in), 'EEE, MMM d')}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-medium">
                                                {format(parseISO(record.clock_in), 'h:mm a')}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-medium">
                                                {record.clock_out ? format(parseISO(record.clock_out), 'h:mm a') : '-'}
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
        </StaffLayout>
    );
};

export default Attendance;