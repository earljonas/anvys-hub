import React from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

const Attendance = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Attendance</h1>
            <p className="text-[hsl(var(--muted-foreground))]">Attendance coming soon...</p>
        </div>
    );
};

Attendance.layout = page => <AdminLayout>{page}</AdminLayout>;

export default Attendance;