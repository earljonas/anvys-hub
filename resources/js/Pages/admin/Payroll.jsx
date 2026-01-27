import React from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

const Payroll = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Payroll</h1>
            <p className="text-[hsl(var(--muted-foreground))]">Payroll coming soon...</p>
        </div>
    );
};

Payroll.layout = page => <AdminLayout>{page}</AdminLayout>;

export default Payroll;