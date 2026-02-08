import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { format, addDays, parseISO, startOfWeek, isSameDay } from 'date-fns';
import {
    ChevronLeft,
    ChevronRight,
    Calendar,
    Plus,
    Trash2,
    MapPin,
    Send
} from 'lucide-react';
import Button from '@/Components/employees/Button';
import Input from '@/Components/employees/Input';
import Select from '@/Components/employees/Select';
import { Card } from '@/Components/employees/Card';
import Modal from '@/Components/employees/Modal';
import Pagination from '@/Components/employees/Pagination';

const ShiftModal = ({ isOpen, onClose, employee, date, locations, shiftToEdit = null }) => {
    if (!isOpen) return null;

    const { data, setData, post, put, delete: destroy, processing, reset, errors, transform } = useForm({
        user_id: employee?.id || '',
        date: date ? format(date, 'yyyy-MM-dd') : '',
        start_time: shiftToEdit ? format(new Date(shiftToEdit.start_time), 'HH:mm') : '09:00',
        end_time: shiftToEdit ? format(new Date(shiftToEdit.end_time), 'HH:mm') : '18:00',
        location_id: shiftToEdit?.location_id || '',
        notes: shiftToEdit?.notes || ''
    });

    React.useEffect(() => {
        transform((data) => ({
            ...data,
            start_time: new Date(`${data.date}T${data.start_time}`).toISOString(),
            end_time: new Date(`${data.date}T${data.end_time}`).toISOString(),
        }));
    }, []);

    const isEdit = !!shiftToEdit;
    const title = isEdit ? 'Edit Shift' : 'Add Shift';

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEdit) {
            put(route('admin.schedule.update', shiftToEdit.id), {
                onSuccess: () => {
                    reset();
                    onClose();
                }
            });
        } else {
            post(route('admin.schedule.store'), {
                onSuccess: () => {
                    reset();
                    onClose();
                }
            });
        }
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this shift?')) {
            destroy(route('admin.schedule.destroy', shiftToEdit.id), {
                onSuccess: () => onClose()
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
            <div className="mb-4 text-sm text-[hsl(var(--muted-foreground))]">
                {employee?.name} • {date && format(date, 'MMM dd, yyyy')}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Start Time</label>
                        <Input
                            type="time"
                            value={data.start_time}
                            onChange={e => setData('start_time', e.target.value)}
                            required
                        />
                        {errors.start_time && <div className="text-[hsl(var(--destructive))] text-xs mt-1">{errors.start_time}</div>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">End Time</label>
                        <Input
                            type="time"
                            value={data.end_time}
                            onChange={e => setData('end_time', e.target.value)}
                            required
                        />
                        {errors.end_time && <div className="text-[hsl(var(--destructive))] text-xs mt-1">{errors.end_time}</div>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Location</label>
                    <Select
                        value={data.location_id}
                        onChange={e => setData('location_id', e.target.value)}
                    >
                        <option value="">Select Location</option>
                        {locations && locations.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                    </Select>
                    {errors.location_id && <div className="text-[hsl(var(--destructive))] text-xs mt-1">{errors.location_id}</div>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Notes (Optional)</label>
                    <Input
                        value={data.notes}
                        onChange={e => setData('notes', e.target.value)}
                        placeholder="e.g. Opening duty, Cover for [Name]"
                    />
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-[hsl(var(--border))] mt-4">
                    {isEdit ? (
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={handleDelete}
                            title="Delete Shift"
                        >
                            <Trash2 size={16} />
                        </Button>
                    ) : <div></div>}

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                        >
                            {processing ? 'Saving...' : (isEdit ? 'Update Shift' : 'Add Shift')}
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

const Schedule = ({ shifts, employees, locations, weekStart }) => {
    const startDate = parseISO(weekStart);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState({ employee: null, date: null, shift: null });

    const openModal = (employee, date, shift = null) => {
        setSelectedSlot({ employee, date, shift });
        setIsModalOpen(true);
    };

    const navigateWeek = (direction) => {
        const newDate = addDays(startDate, direction * 7);
        router.get(route('admin.schedule'), { start_date: format(newDate, 'yyyy-MM-dd') });
    };

    const getShiftsForCell = (userId, date) => {
        return shifts.filter(s =>
            s.user_id === userId &&
            isSameDay(new Date(s.start_time), date)
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Head title="Schedule Management" />

            <ShiftModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                employee={selectedSlot.employee}
                date={selectedSlot.date}
                locations={locations}
                shiftToEdit={selectedSlot.shift}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Schedule</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-[hsl(var(--card))] p-1 rounded-lg border border-[hsl(var(--border))] shadow-sm">
                        <Button variant="ghost" size="icon-sm" onClick={() => navigateWeek(-1)}>
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div className="px-4 font-medium flex items-center gap-2 text-[hsl(var(--foreground))]">
                            <Calendar className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                            {format(weekDays[0], 'MMM dd')} - {format(weekDays[6], 'MMM dd, yyyy')}
                        </div>
                        <Button variant="ghost" size="icon-sm" onClick={() => navigateWeek(1)}>
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>

                    <Button
                        className="gap-2 shadow-sm"
                        onClick={() => {
                            if (confirm('Are you sure you want to publish the schedule for this week? Employees will be able to see their shifts.')) {
                                router.post(route('admin.schedule.publish'), { week_start: format(startDate, 'yyyy-MM-dd') });
                            }
                        }}
                    >
                        <Send size={18} /> Publish Schedule
                    </Button>
                </div>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr>
                                <th className="sticky left-0 z-10 bg-[hsl(var(--card))]/95 backdrop-blur border-b border-r border-[hsl(var(--border))] p-4 min-w-[200px] text-left">
                                    <span className="text-[hsl(var(--muted-foreground))] font-medium">Employee</span>
                                </th>
                                {weekDays.map(day => (
                                    <th key={day.toString()} className="border-b border-[hsl(var(--border))] p-3 min-w-[140px] bg-[hsl(var(--muted))]/30">
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase">{format(day, 'EEE')}</span>
                                            <span className={`text-lg font-bold ${isSameDay(day, new Date()) ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))]'}`}>
                                                {format(day, 'dd')}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[hsl(var(--border))]">
                            {employees.data && employees.data.map(employee => (
                                <tr key={employee.id} className="group hover:bg-[hsl(var(--muted))]/20 transition-colors">
                                    <td className="sticky left-0 z-10 bg-[hsl(var(--card))] group-hover:bg-[hsl(var(--muted))]/20 border-r border-[hsl(var(--border))] p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-bold border border-gray-200">
                                                {employee.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-[hsl(var(--foreground))]">{employee.name}</div>
                                                <div className="text-xs text-[hsl(var(--muted-foreground))]">{employee.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    {weekDays.map(day => {
                                        const cellShifts = getShiftsForCell(employee.id, day);
                                        return (
                                            <td key={day.toString()} className="p-2 border-r border-[hsl(var(--border))]/50 align-top h-32 relative group/cell">
                                                <div className="min-h-full flex flex-col gap-2">
                                                    {cellShifts.map(shift => (
                                                        <div
                                                            key={shift.id}
                                                            onClick={() => openModal(employee, day, shift)}
                                                            className={`
                                                                p-2 rounded-lg text-xs hover:shadow-md transition-shadow cursor-pointer border
                                                                ${shift.status === 'draft'
                                                                    ? 'bg-gray-50 border-gray-200 text-gray-500 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(0,0,0,0.03)_5px,rgba(0,0,0,0.03)_10px)]'
                                                                    : 'bg-pink-50 border-pink-100 text-pink-700 hover:bg-pink-100'
                                                                }
                                                            `}
                                                        >
                                                            <div className="flex justify-between">
                                                                <span className="font-bold">
                                                                    {format(new Date(shift.start_time), 'h:mm a')} - {format(new Date(shift.end_time), 'h:mm a')}
                                                                </span>
                                                                {shift.status === 'draft' && (
                                                                    <span className="text-[10px] bg-gray-200 px-1 rounded text-gray-600 font-bold uppercase">Draft</span>
                                                                )}
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
                                                    ))}

                                                    {cellShifts.length === 0 && (
                                                        <button
                                                            onClick={() => openModal(employee, day)}
                                                            className="w-full py-1.5 rounded-lg border border-dashed border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5 transition-all opacity-0 group-hover/cell:opacity-100 flex items-center justify-center cursor-pointer"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
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
            </Card>

            <Pagination links={employees.links} />
        </div>
    );
};

Schedule.layout = page => <AdminLayout>{page}</AdminLayout>;

export default Schedule;