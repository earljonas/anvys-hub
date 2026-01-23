import React from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

const Employees = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Employees</h1>
            <p className="text-[hsl(var(--muted-foreground))]">Employee management coming soon...</p>
        </div>
    );
};

Employees.layout = page => <AdminLayout>{page}</AdminLayout>;

export default Employees;
