import React from 'react';
import Sidebar from '../Components/Sidebar';

const AdminLayout = ({ children }) => {
    return (
        <div className="flex h-screen bg-zinc-50 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8 relative">
                <div className="max-w-7xl mx-auto space-y-6">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
