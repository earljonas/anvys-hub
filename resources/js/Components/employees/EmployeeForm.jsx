import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Input from '../common/Input';
import Button from '../common/Button';


export default function EmployeeForm({ employee, locations, onSuccess, onCancel }) {
    const isEdit = !!employee;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        contact_number: '',
        address: '',
        location_id: '',
        job_title: '',
        department: '',
        employment_type: 'full_time',
        hourly_rate: 0,
        basic_salary: 0,
        clock_pin: '',
    });

    useEffect(() => {
        if (employee) {
            setData({
                first_name: employee.first_name || '',
                last_name: employee.last_name || '',
                contact_number: employee.contact_number || '',
                address: employee.address || '',
                location_id: employee.employee_profile?.location_id || '',
                job_title: employee.employee_profile?.job_title || '',
                department: employee.employee_profile?.department || '',
                employment_type: employee.employee_profile?.employment_type || 'full_time',
                hourly_rate: employee.employee_profile?.hourly_rate || 0,
                basic_salary: employee.employee_profile?.basic_salary || 0,
                clock_pin: employee.clock_pin || '',
            });
        }
    }, [employee]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const action = isEdit
            ? put(route('admin.employees.update', employee.id))
            : post(route('admin.employees.store'));

        action.then(() => { onSuccess(); reset(); });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="First Name"
                    value={data.first_name}
                    onChange={e => setData('first_name', e.target.value)}
                    error={errors.first_name}
                />
                <Input
                    label="Last Name"
                    value={data.last_name}
                    onChange={e => setData('last_name', e.target.value)}
                    error={errors.last_name}
                />
            </div>

            {/* ... Rest of your inputs mapped similarly ... */}

            <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={processing}>
                    {isEdit ? 'Save Changes' : 'Create Employee'}
                </Button>
            </div>
        </form>
    );
}