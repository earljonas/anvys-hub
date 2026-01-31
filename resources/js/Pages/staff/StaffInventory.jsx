import React from 'react';
import { Head } from '@inertiajs/react';
import StaffLayout from '../../Layouts/StaffLayout';

const StaffInventory = () => {
    return (
        <div className='space-y-6'>
            <Head title="Inventory" />
            <h1 className='text-2xl font-bold'>Inventory</h1>
        </div>
    );
};


StaffInventory.layout = (page) => <StaffLayout>{page}</StaffLayout>;

export default StaffInventory;