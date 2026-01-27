import React from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

const Roster = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Roster</h1>
            <p className="text-[hsl(var(--muted-foreground))]">Roster coming soon...</p>
        </div>
    );
};

Roster.layout = page => <AdminLayout>{page}</AdminLayout>;

export default Roster;