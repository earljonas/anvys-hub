import React from 'react';
import Navbar from '../Components/Navbar';

const StaffLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col font-sans text-[hsl(var(--foreground))]">

            {/* 1. Navbar (Sticky at top) */}
            <Navbar />

            {/* 2. Main Content Area */}
            <main className="flex-1 w-full p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">

                {/* Content Container 
                   - max-w-[1600px]: wider than standard websites because POS systems need space.
                   - mx-auto: centers the container.
                */}
                <div className="max-w-[1600px] mx-auto w-full h-full">
                    {children}
                </div>

            </main>

            {/* Optional: Subtle Background Pattern (dotted) to make it look professional */}
            <div className="fixed inset-0 -z-10 h-full w-full bg-[hsl(var(--background))] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [bg-size:16px_16px] opacity-40 pointer-events-none"></div>
        </div>
    );
};

export default StaffLayout;