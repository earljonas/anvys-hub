import React from 'react';
import Navbar from '../Components/Navbar';

const StaffLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
            <Navbar />

            <main className="flex-1 p-6 relative">
                <div className="max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default StaffLayout;
