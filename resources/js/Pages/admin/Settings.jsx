import React from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

const Settings = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Settings</h1>
            <p className="text-[hsl(var(--muted-foreground))]">Settings coming soon...</p>
        </div>
    );
};

Settings.layout = page => <AdminLayout>{page}</AdminLayout>;

export default Settings;
