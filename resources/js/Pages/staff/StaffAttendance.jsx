import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import StaffLayout from '../../Layouts/StaffLayout';
import { Clock, Calendar, LogIn, LogOut, History, MapPin } from 'lucide-react';

const StaffAttendance = () => {
    // State for live clock
    const [currentTime, setCurrentTime] = useState(new Date());
    // State for attendance status (Mock logic)
    const [isClockedIn, setIsClockedIn] = useState(false);

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleClockAction = () => {
        // Here you would make an Inertia post request to your backend
        setIsClockedIn(!isClockedIn);
    };

    // Mock History Data
    const RECENT_HISTORY = [
        { id: 1, date: 'Yesterday', in: '08:00 AM', out: '05:00 PM', total: '8h', status: 'Complete' },
        { id: 2, date: 'Jan 7, 2025', in: '08:15 AM', out: '05:15 PM', total: '8h', status: 'Complete' },
        { id: 3, date: 'Jan 6, 2025', in: '08:00 AM', out: '05:00 PM', total: '8h', status: 'Complete' },
    ];

    return (
        // 1. Removed "min-h-screen" here because StaffLayout handles it
        <div className="space-y-6">
            <Head title="Staff Attendance" />

            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                {/* Live Date/Time Display */}
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl border border-[hsl(var(--border))] shadow-sm">

                    <div className="text-right">
                        <div className="text-xs text-[hsl(var(--muted-foreground))] font-medium uppercase tracking-wider">Current Time</div>
                        <div className="font-mono text-lg font-bold text-[hsl(var(--foreground))] leading-none">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-[hsl(var(--border))] shadow-sm overflow-hidden h-full flex flex-col items-center justify-center p-8 md:p-12 text-center relative">

                        {/* Background Decoration */}
                        <div className={`absolute inset-0 opacity-5 pointer-events-none transition-colors duration-500`} />

                        <div className="relative z-10 space-y-6 max-w-md w-full">

                            {/* Status Pill */}
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${isClockedIn
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-500 border border-red-100'
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${isClockedIn ? 'bg-green-600 animate-pulse' : 'bg-red-500'}`} />
                                {isClockedIn ? 'Currently Clocked In' : 'Currently Clocked Out'}
                            </div>

                            {/* Main Timer Display */}
                            <div className="space-y-1">
                                <div className="text-6xl md:text-7xl font-bold tracking-tight text-[hsl(var(--foreground))] tabular-nums">
                                    {isClockedIn ? "04:23:10" : "00:00:00"}
                                </div>
                                <p className="text-[hsl(var(--muted-foreground))] font-medium">
                                    {isClockedIn ? 'Time Elapsed' : 'Shift Duration'}
                                </p>
                            </div>
                            <button
                                onClick={handleClockAction}
                                className={`w-full group relative flex items-center justify-center gap-3 px-8 py-5 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform active:scale-95 ${isClockedIn
                                    ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
                                    : 'bg-[hsl(var(--primary))] hover:opacity-90 shadow-[hsl(var(--primary))]/30'
                                    }`}
                            >
                                {isClockedIn ? 'CLOCK OUT' : 'CLOCK IN'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: RECENT HISTORY LIST */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-[hsl(var(--border))] shadow-sm h-full flex flex-col">
                        <div className="p-5 border-b border-[hsl(var(--border))] flex items-center justify-between">
                            <h3 className="font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
                                <History size={18} className="text-[hsl(var(--primary))]" />
                                Recent Activity
                            </h3>
                            <button className="text-xs font-medium text-[hsl(var(--primary))] hover:underline">View All</button>
                        </div>

                        <div className="p-4 space-y-3 overflow-y-auto max-h-[400px]">
                            {RECENT_HISTORY.map((record) => (
                                <div key={record.id} className="p-3 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/30 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-semibold text-[hsl(var(--foreground))]">{record.date}</span>
                                        <span className="text-xs bg-[hsl(var(--muted))] px-2 py-0.5 rounded text-[hsl(var(--muted-foreground))]">{record.total}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-[hsl(var(--muted-foreground))] text-xs uppercase">Time In</span>
                                            <span className="font-medium text-[hsl(var(--success))]">{record.in}</span>
                                        </div>
                                        <div className="h-8 w-px bg-[hsl(var(--border))]" />
                                        <div className="flex flex-col items-end">
                                            <span className="text-[hsl(var(--muted-foreground))] text-xs uppercase">Time Out</span>
                                            <span className="font-medium text-[hsl(var(--foreground))]">{record.out}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};


StaffAttendance.layout = page => <StaffLayout>{page}</StaffLayout>;

export default StaffAttendance;