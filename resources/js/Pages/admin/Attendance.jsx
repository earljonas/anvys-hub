import React, { useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import { Calendar, ChevronDown } from 'lucide-react';

// Mock Data
const MOCK_ATTENDANCE_GROUPS = [
    {
        date: 'Wednesday, January 8, 2025',
        records: [
            { id: 1, name: 'Maria Santos', initials: 'MS', in: '08:00 AM', out: '05:00 PM', total: '8h' },
            { id: 2, name: 'Juan Dela Cruz', initials: 'JDC', in: '08:30 AM', out: '05:30 PM', total: '8h' },
            { id: 3, name: 'Ana Reyes', initials: 'AR', in: '09:00 AM', out: '06:00 PM', total: '8h' },
        ]
    },
    {
        date: 'Tuesday, January 7, 2025',
        records: [
            { id: 4, name: 'Maria Santos', initials: 'MS', in: '07:45 AM', out: '04:45 PM', total: '8h' },
            { id: 5, name: 'Carlos Garcia', initials: 'CG', in: '08:00 AM', out: '05:00 PM', total: '8h' },
        ]
    }
];

const Attendance = () => {
    const [expandedDates, setExpandedDates] = useState({
        'Wednesday, January 8, 2025': true
    });

    const toggleDate = (date) => {
        setExpandedDates(prev => ({
            ...prev,
            [date]: !prev[date]
        }));
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-5 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Attendance</h1>
            </div>

            <div className="space-y-4">
                {MOCK_ATTENDANCE_GROUPS.map((group) => {
                    const isExpanded = expandedDates[group.date];

                    return (
                        <div
                            key={group.date}
                            className="border border-[hsl(var(--border))] rounded-xl overflow-hidden shadow-sm bg-[hsl(var(--card))]"
                        >
                            {/* Date Header */}
                            <button
                                onClick={() => toggleDate(group.date)}
                                className="w-full flex items-center justify-between p-4 transition-colors border-b border-[hsl(var(--border))] bg-white hover:bg-[hsl(var(--muted))]/40"
                            >
                                <div className="flex items-center gap-3">
                                    <Calendar className="text-[hsl(var(--muted-foreground))]" size={18} />
                                    <span className="font-semibold text-[hsl(var(--foreground))]">
                                        {group.date}
                                    </span>
                                </div>
                                {/* Animated Chevron */}
                                <div className={`text-[hsl(var(--muted-foreground))] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                    <ChevronDown size={20} />
                                </div>
                            </button>

                            <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                <div className="overflow-hidden bg-white">
                                    <div className="divide-y divide-[hsl(var(--border))]">
                                        {group.records.map((record) => (
                                            <div
                                                key={record.id}
                                                className="flex flex-col md:flex-row md:items-center justify-between p-4 hover:bg-[hsl(var(--muted))]/30 transition-colors gap-4"
                                            >
                                                {/* Employee Info */}
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--primary))]">
                                                        {record.initials}
                                                    </div>
                                                    <span className="font-medium text-[hsl(var(--foreground))]">
                                                        {record.name}
                                                    </span>
                                                </div>

                                                {/* Time Info */}
                                                <div className="flex items-center gap-4 text-sm md:text-base ml-14 md:ml-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[hsl(var(--muted-foreground))] text-xs uppercase font-medium">In:</span>
                                                        <span className="text-[hsl(var(--success))] font-medium">{record.in}</span>
                                                    </div>

                                                    <div className="h-4 w-px bg-[hsl(var(--border))]" />

                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[hsl(var(--muted-foreground))] text-xs uppercase font-medium">Out:</span>
                                                        <span className="text-[hsl(var(--foreground))] font-medium">{record.out}</span>
                                                    </div>

                                                    {/* Total Hours Badge */}
                                                    <div className="hidden sm:flex ml-4 px-3 py-1 bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--primary))] rounded-full text-xs font-bold items-center gap-1">
                                                        {record.total}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

Attendance.layout = page => <AdminLayout>{page}</AdminLayout>;

export default Attendance;