import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalIcon, History, Clock } from 'lucide-react';
import Button from '../../Components/common/Button';
import EventModal from '../../Components/events/EventModal';
import DayDetailsModal from '../../Components/events/DayDetailsModal';
import AddPaymentModal from '../../Components/events/AddPaymentModal';

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const Events = () => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(today);
    const [selectedDate, setSelectedDate] = useState(null);
    const [rightPanelTab, setRightPanelTab] = useState('upcoming');

    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [eventModalMode, setEventModalMode] = useState('add');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isDayModalOpen, setIsDayModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const { events: initialEvents = [], packages = [] } = usePage().props;
    const [events, setEvents] = useState(initialEvents);

    React.useEffect(() => {
        setEvents(initialEvents);
    }, [initialEvents]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const calendarGrid = [...blanks, ...days];

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const upcomingEvents = events.filter(e => {
        const eventDate = new Date(e.eventDate);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= startOfToday;
    }).sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

    const historyEvents = events.filter(e => {
        const eventDate = new Date(e.eventDate);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate < startOfToday;
    }).sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const handleMonthSelect = (e) => setCurrentDate(new Date(year, parseInt(e.target.value), 1));
    const handleYearSelect = (e) => setCurrentDate(new Date(parseInt(e.target.value), month, 1));

    const handleDayClick = (day) => {
        if (!day) return;
        const clickedDate = new Date(year, month, day);
        setSelectedDate(clickedDate);
        setIsDayModalOpen(true);
    };

    const handleAddEvent = (specificDate = null) => {
        setIsDayModalOpen(false);
        setSelectedDate(specificDate || new Date());
        setSelectedEvent(null);
        setEventModalMode('add');
        setIsEventModalOpen(true);
    };

    const handleViewEvent = (event) => {
        setIsDayModalOpen(false);
        setSelectedEvent(event);

        const eventDate = new Date(event.eventDate);
        eventDate.setHours(0, 0, 0, 0);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        if (eventDate < todayDate || event.status === 'CANCELLED') {
            setEventModalMode('view-only');
        } else {
            setEventModalMode('view');
        }

        setIsEventModalOpen(true);
    };

    const handleSaveEvent = (data) => {
        if (data.id) {
            router.put(`/admin/events/${data.id}`, data, {
                onSuccess: () => setIsEventModalOpen(false),
                preserveScroll: true
            });
        } else {
            router.post('/admin/events', data, {
                onSuccess: () => setIsEventModalOpen(false),
                preserveScroll: true
            });
        }
    };

    const handleAddPayment = (event) => {
        setSelectedEvent(event);
        setIsEventModalOpen(false);
        setIsPaymentModalOpen(true);
    };

    const handleSavePayment = (paymentData) => {
        router.post(`/admin/events/${paymentData.eventId}/payments`, {
            amount: paymentData.amount,
            notes: paymentData.notes
        }, {
            onSuccess: () => {
                setIsPaymentModalOpen(false);
                setSelectedEvent(null);
            },
            preserveScroll: true
        });
    };

    const handleCancelEvent = (eventId) => {
        router.post(`/admin/events/${eventId}/cancel`, {}, {
            onSuccess: () => setIsEventModalOpen(false),
            preserveScroll: true
        });
    };

    const getEventsForDay = (day) => {
        if (!day) return [];

        const date = new Date(year, month, day);
        const dateStr = date.toLocaleDateString('en-CA');
        return events.filter(e => e.eventDate === dateStr);
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Helper to get status badge style
    const getStatusBadgeClass = (status) => {
        if (status === 'CANCELLED') {
            return 'bg-red-100 text-red-700';
        }
        return 'bg-green-100 text-green-700';
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-5 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Event Booking</h1>
                </div>
                <Button variant="primary" onClick={() => handleAddEvent()} className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                    <Plus size={18} /> Add Event
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[hsl(var(--card))] rounded-[var(--radius)] shadow-sm border border-[hsl(var(--border))] p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                        <div className="flex items-center gap-2">
                            <select value={month} onChange={handleMonthSelect} className="text-xl font-bold bg-transparent border-none focus:ring-0 cursor-pointer text-[hsl(var(--foreground))]">
                                {monthNames.map((m, idx) => <option key={m} value={idx}>{m}</option>)}
                            </select>
                            <select value={year} onChange={handleYearSelect} className="text-xl font-bold bg-transparent border-none focus:ring-0 cursor-pointer text-[hsl(var(--foreground))]">
                                {Array.from({ length: 10 }, (_, i) => today.getFullYear() - 2 + i).map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handlePrevMonth} className="p-2 hover:bg-[hsl(var(--muted))] rounded-full border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={handleNextMonth} className="p-2 hover:bg-[hsl(var(--muted))] rounded-full border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-4 mb-2">
                        {weekDays.map(day => (
                            <div key={day} className="text-center text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2 sm:gap-4">
                        {calendarGrid.map((day, index) => {
                            if (!day) return <div key={`empty-${index}`} />;
                            const dayEvents = getEventsForDay(day);
                            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                            const isSelected = selectedDate && day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
                            const hasCancelledEvent = dayEvents.some(e => e.status === 'CANCELLED');

                            return (
                                <div
                                    key={day}
                                    onClick={() => handleDayClick(day)}
                                    className={`aspect-square rounded-[var(--radius)] p-2 relative cursor-pointer transition-all border flex flex-col items-start justify-between group ${isSelected ? 'border-[hsl(var(--primary))] ring-2 ring-[hsl(var(--primary))/20]' : 'border-transparent hover:border-[hsl(var(--border))] hover:shadow-md bg-[hsl(var(--background))] hover:bg-white'}`}
                                >
                                    <span className={`text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full ${isToday ? 'bg-[hsl(var(--primary))] text-white shadow-md' : 'text-[hsl(var(--foreground))]'}`}>
                                        {day}
                                    </span>
                                    <div className="flex gap-1 flex-wrap w-full mt-1">
                                        {dayEvents.slice(0, 3).map((ev, i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 w-1.5 rounded-full ${ev.status === 'CANCELLED' ? 'bg-red-400' : 'bg-[hsl(var(--primary))]'}`}
                                                title={`${ev.customerName}${ev.status === 'CANCELLED' ? ' (Cancelled)' : ''}`}
                                            />
                                        ))}
                                        {dayEvents.length > 3 && <span className="text-[10px] text-[hsl(var(--muted-foreground))]">+</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-[hsl(var(--card))] rounded-[var(--radius)] p-1 border border-[hsl(var(--border))] flex">
                        <button onClick={() => setRightPanelTab('upcoming')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${rightPanelTab === 'upcoming' ? 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] shadow-sm' : 'text-[hsl(var(--muted-foreground))]'}`}>
                            <CalIcon size={16} /> Upcoming
                        </button>
                        <button onClick={() => setRightPanelTab('history')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${rightPanelTab === 'history' ? 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] shadow-sm' : 'text-[hsl(var(--muted-foreground))]'}`}>
                            <History size={16} /> History
                        </button>
                    </div>

                    <div className="bg-[hsl(var(--card))] rounded-[var(--radius)] shadow-sm border border-[hsl(var(--border))] p-5 min-h-[500px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-[hsl(var(--foreground))]">{rightPanelTab === 'upcoming' ? 'Upcoming Events' : 'Booking History'}</h3>
                            <CalIcon size={20} className="text-[hsl(var(--muted-foreground))]" />
                        </div>
                        <div className="space-y-4">
                            {(rightPanelTab === 'upcoming' ? upcomingEvents : historyEvents).length === 0 ? (
                                <div className="text-center text-[hsl(var(--muted-foreground))] py-10">No {rightPanelTab} events found.</div>
                            ) : (
                                (rightPanelTab === 'upcoming' ? upcomingEvents : historyEvents).map(event => (
                                    <div
                                        key={event.id}
                                        onClick={() => handleViewEvent(event)}
                                        className={`group p-4 rounded-[var(--radius)] bg-[hsl(var(--background))] hover:bg-[hsl(var(--muted))] border border-transparent hover:border-[hsl(var(--border))] transition-all cursor-pointer ${event.status === 'CANCELLED' ? 'opacity-60' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <h4 className={`font-bold group-hover:text-[hsl(var(--primary))] transition-colors ${event.status === 'CANCELLED' ? 'line-through text-[hsl(var(--muted-foreground))]' : 'text-[hsl(var(--foreground))]'}`}>
                                                    {event.customerName}
                                                </h4>
                                                {event.status === 'CANCELLED' && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                                                        CANCELLED
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--primary))/10] text-[hsl(var(--primary))] font-medium">
                                                {new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
                                            {event.packageName || packages.find(p => p.id === event.packageId)?.name || 'Custom Event'}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))] border-t border-[hsl(var(--border))] pt-2 mt-2">
                                            <span className="flex items-center gap-1"><Clock size={12} /> {event.eventTime}</span>
                                            <span className="flex items-center gap-1"><span className="font-semibold text-[hsl(var(--foreground))]">₱{event.totalPrice?.toLocaleString()}</span> Total</span>
                                            {event.paymentStatus && (
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${event.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                                                        event.paymentStatus === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {event.paymentStatus}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <DayDetailsModal
                isOpen={isDayModalOpen}
                onClose={() => setIsDayModalOpen(false)}
                date={selectedDate}
                events={selectedDate ? getEventsForDay(selectedDate.getDate()) : []}
                onAddEvent={() => handleAddEvent(selectedDate)}
                onViewEvent={handleViewEvent}
            />

            <EventModal
                isOpen={isEventModalOpen}
                onClose={() => setIsEventModalOpen(false)}
                mode={eventModalMode}
                event={selectedEvent}
                selectedDate={selectedDate}
                onSave={handleSaveEvent}
                packages={packages}
                onAddPayment={handleAddPayment}
                onCancelEvent={handleCancelEvent}
            />

            <AddPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                event={selectedEvent}
                onSave={handleSavePayment}
            />
        </div>
    );
};

Events.layout = page => <AdminLayout>{page}</AdminLayout>;
export default Events;