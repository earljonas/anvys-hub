import React from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

const Events = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Events</h1>
            <p className="text-[hsl(var(--muted-foreground))]">Event management coming soon...</p>
        </div>
    );
};

Events.layout = page => <AdminLayout>{page}</AdminLayout>;

export default Events;
