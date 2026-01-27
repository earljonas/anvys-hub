import React from 'react';
import { Head } from '@inertiajs/react';

const Attendance = () => {
    return (
        <div className="min-h-screen bg-[hsl(var(--background))] p-8">
            <Head title="Staff Attendance" />
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
                    Staff Attendance
                </h1>
                <p className="text-[hsl(var(--muted-foreground))] mt-2">
                    Attendance tracking coming soon...
                </p>
            </div>
        </div>
    );
};

export default Attendance;
