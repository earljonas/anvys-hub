import React from 'react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { Calendar, Users, MapPin, TrendingUp, Clock, Download } from 'lucide-react';
import StatCard from '../../../Components/reports/StatCard';
import Button from '../../../Components/common/Button';

const EventsReports = ({ stats, upcomingEvents, monthlyEvents }) => {

    // Calculate max events for chart scaling
    const maxEvents = Math.max(...monthlyEvents.map(m => m.events), 1);

    const exportEventsToCSV = () => {
        const headers = ['Customer Name', 'Package', 'Date', 'Time', 'Attendees', 'Payment Status'];
        const rows = upcomingEvents.map(event => [
            `"${event.name}"`,
            event.package,
            event.date,
            event.time,
            event.attendees,
            event.status,
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `events-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-5 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Events Reports</h1>
                </div>
                <Button
                    variant="primary"
                    className="flex items-center gap-2 shadow-lg shadow-pink-500/20 cursor-pointer"
                    onClick={exportEventsToCSV}
                >
                    <Download size={18} /> Export CSV
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Events"
                    value={stats.totalEvents}
                    subtitle="This month"
                    icon={Calendar}
                    variant="primary"
                />
                <StatCard
                    title="Upcoming Events"
                    value={stats.upcomingEvents}
                    subtitle="Scheduled"
                    icon={TrendingUp}
                    variant="success"
                />
                <StatCard
                    title="Total Attendees"
                    value={stats.totalAttendees}
                    subtitle="Est. this month"
                    icon={Users}
                    variant="warning"
                />
                <StatCard
                    title="Locations Used"
                    value={stats.locationsUsed}
                    subtitle="Active locations"
                    icon={MapPin}
                    variant="primary"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Events Growth Chart */}
                <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-6">Events Overview (Last 6 Months)</h3>
                    <div className="h-[300px] w-full relative">
                        {/* Y-Axis Labels */}
                        <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-xs text-[hsl(var(--muted-foreground))]">
                            <span>{maxEvents}</span>
                            <span>{Math.round(maxEvents * 0.75)}</span>
                            <span>{Math.round(maxEvents * 0.5)}</span>
                            <span>{Math.round(maxEvents * 0.25)}</span>
                            <span>0</span>
                        </div>

                        {/* Bars Container */}
                        <div className="absolute left-10 right-0 top-0 bottom-6 flex items-end justify-around">
                            {/* Grid Lines */}
                            {[0, 25, 50, 75].map((pos) => (
                                <div key={pos} className="absolute w-full border-t border-dashed border-[hsl(var(--border))]" style={{ top: `${pos}%` }}></div>
                            ))}

                            {monthlyEvents.map((item, idx) => (
                                <div key={idx} className="w-12 sm:w-16 h-full flex items-end relative group">
                                    <div
                                        className="w-full bg-[hsl(var(--primary))] rounded-t-lg hover:opacity-90 transition-all duration-500"
                                        style={{ height: maxEvents > 0 ? `${(item.events / maxEvents) * 100}%` : '0%' }}
                                    >
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 transition-opacity">
                                            {item.events} events
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* X-Axis Labels */}
                        <div className="absolute left-10 right-0 bottom-0 flex justify-around text-xs font-medium text-[hsl(var(--muted-foreground))] pt-2">
                            {monthlyEvents.map((item, idx) => (
                                <span key={idx}>{item.name}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Upcoming Events Table */}
                <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                        <Calendar size={20} /> Upcoming Events
                    </h3>
                    {upcomingEvents.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[hsl(var(--border))]">
                                        <th className="text-left py-3 px-2 font-semibold text-[hsl(var(--muted-foreground))]">Event</th>
                                        <th className="text-left py-3 px-2 font-semibold text-[hsl(var(--muted-foreground))]">Date</th>
                                        <th className="text-center py-3 px-2 font-semibold text-[hsl(var(--muted-foreground))]">Attendees</th>
                                        <th className="text-center py-3 px-2 font-semibold text-[hsl(var(--muted-foreground))]">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {upcomingEvents.map((event) => (
                                        <tr key={event.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
                                            <td className="py-3 px-2">
                                                <div className="font-medium text-[hsl(var(--foreground))]">{event.name}</div>
                                                <div className="text-xs text-[hsl(var(--muted-foreground))]">{event.package}</div>
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="text-[hsl(var(--foreground))]">{event.date}</div>
                                                <div className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                                                    <Clock size={10} /> {event.time}
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 text-center text-[hsl(var(--muted-foreground))]">
                                                {event.attendees}
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                <span className={`
                                                    px-2 py-1 rounded-full text-xs font-medium capitalize
                                                    ${event.status?.toLowerCase() === 'paid' ? 'bg-green-100 text-green-700' :
                                                        event.status?.toLowerCase() === 'partial' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-red-100 text-red-700'}
                                                `}>
                                                    {event.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-[hsl(var(--muted-foreground))]">
                            <Calendar size={48} className="mx-auto mb-2 opacity-30" />
                            <p>No upcoming events scheduled.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

EventsReports.layout = page => <AdminLayout>{page}</AdminLayout>;

export default EventsReports;
