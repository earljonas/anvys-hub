import React from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

const Reports = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Reports</h1>
            <p className="text-[hsl(var(--muted-foreground))]">Reports coming soon...</p>
        </div>
    );
};

Reports.layout = page => <AdminLayout>{page}</AdminLayout>;

export default Reports;
