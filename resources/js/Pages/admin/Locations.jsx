import React from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

const Locations = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Locations</h1>
            <p className="text-[hsl(var(--muted-foreground))]">Location management coming soon...</p>
        </div>
    );
};

Locations.layout = page => <AdminLayout>{page}</AdminLayout>;

export default Locations;
