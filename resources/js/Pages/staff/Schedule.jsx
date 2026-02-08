import React from 'react';
import { Head, router } from '@inertiajs/react';
import StaffLayout from '@/Layouts/StaffLayout';
import { format, addDays, parseISO, startOfWeek, isSameDay } from 'date-fns';
import {
    ChevronLeft,
    ChevronRight,
    Calendar,
    MapPin,
} from 'lucide-react';
import Pagination from '@/Components/employees/Pagination';

const Schedule = ({ shifts, employees, weekStart }) => {
    const startDate = parseISO(weekStart);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

    const navigateWeek = (direction) => {
        const newDate = addDays(startDate, direction * 7);
        router.get(route('staff.schedule'), { start_date: format(newDate, 'yyyy-MM-dd') });
    };

    const getShiftsForCell = (userId, date) => {
        return shifts.filter(s =>
            s.user_id === userId &&
            isSameDay(new Date(s.start_time), date)
        );
    };

    return (
        <StaffLayout>
            <Head title="Shift Schedule" />

            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Shift Schedule</h1>
                    </div>

                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
                        <button onClick={() => navigateWeek(-1)} className="p-2 hover:bg-gray-100 rounded-md transition-colors cursor-pointer text-gray-600">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="px-4 font-medium flex items-center gap-2 text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {format(weekDays[0], 'MMM dd')} - {format(weekDays[6], 'MMM dd, yyyy')}
                        </div>
                        <button onClick={() => navigateWeek(1)} className="p-2 hover:bg-gray-100 rounded-md transition-colors cursor-pointer text-gray-600">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Roster Grid */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr>
                                    <th className="sticky left-0 z-10 bg-gray-50/95 backdrop-blur border-b border-r border-gray-200 p-4 min-w-[200px] text-left">
                                        <span className="text-gray-500 font-medium">Employee</span>
                                    </th>
                                    {weekDays.map(day => (
                                        <th key={day.toString()} className="border-b border-gray-100 p-3 min-w-[140px] bg-gray-50/50">
                                            <div className="flex flex-col items-center">
                                                <span className={`text-xs font-bold uppercase ${isSameDay(day, new Date()) ? 'text-pink-600' : 'text-gray-400'}`}>{format(day, 'EEE')}</span>
                                                <span className={`text-lg font-bold ${isSameDay(day, new Date()) ? 'text-pink-600' : 'text-gray-700'}`}>
                                                    {format(day, 'dd')}
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {employees.data && employees.data.map(employee => (
                                    <tr key={employee.id} className="group hover:bg-gray-50/30 transition-colors">
                                        <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50/30 border-r border-gray-200 p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold border border-gray-200">
                                                    {employee.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{employee.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {weekDays.map(day => {
                                            const cellShifts = getShiftsForCell(employee.id, day);
                                            return (
                                                <td key={day.toString()} className="p-2 border-r border-gray-50/50 align-top h-24">
                                                    <div className="min-h-full flex flex-col gap-2">
                                                        {cellShifts.length > 0 ? cellShifts.map(shift => (
                                                            <div
                                                                key={shift.id}
                                                                className="bg-pink-50 border border-pink-100 text-pink-700 p-2 rounded-lg text-xs hover:shadow-sm transition-shadow"
                                                            >
                                                                <div className="font-bold">
                                                                    {format(new Date(shift.start_time), 'h:mm a')} - {format(new Date(shift.end_time), 'h:mm a')}
                                                                </div>
                                                                <div className="opacity-75 mt-1 truncate">
                                                                    {shift.notes || 'Regular Shift'}
                                                                </div>
                                                                {shift.location && (
                                                                    <div className="flex items-center gap-1 mt-1 text-[10px] font-medium opacity-90">
                                                                        <MapPin size={10} />
                                                                        <span className="truncate max-w-full">{shift.location.name}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )) : (
                                                            <div className="h-full flex items-center justify-center">
                                                                <span className="text-gray-200 text-xs font-medium">-</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Pagination links={employees.links} />
            </div>
        </StaffLayout>
    );
};

export default Schedule;