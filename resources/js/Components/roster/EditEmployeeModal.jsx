import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

const EditEmployeeModal = ({ isOpen, onClose, employee, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        position: '',
        location: '',
        email: '',
        contactNumber: '',
        rate: '',
        status: 'Active',
        employeeId: ''
    });

    useEffect(() => {
        if (employee) {
            setFormData({
                name: employee.name || '',
                position: employee.position || '',
                location: employee.location || '',
                email: employee.email || '',
                contactNumber: employee.contactNumber || '',
                rate: employee.rate || '',
                status: employee.status || 'Active',
                employeeId: employee.employeeId || ''
            });
        }
    }, [employee]);

    if (!isOpen || !employee) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...employee, ...formData });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-4 overflow-hidden border border-[hsl(var(--border))]">
                <div className="flex justify-between items-center p-4 border-b border-[hsl(var(--border))]">
                    <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Edit Employee</h3>
                    <button onClick={onClose} className="p-1 hover:bg-[hsl(var(--muted))] rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Read Only ID */}
                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1">Employee ID</label>
                        <Input
                            value={formData.employeeId}
                            disabled
                            className="bg-[hsl(var(--muted))] opacity-75"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Full Name</label>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Position</label>
                            <Input
                                value={formData.position}
                                onChange={e => setFormData({ ...formData, position: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Contact Number</label>
                            <Input
                                value={formData.contactNumber}
                                onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Email</label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Location</label>
                            <Input
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Rate</label>
                            <Input
                                type="number"
                                value={formData.rate}
                                onChange={e => setFormData({ ...formData, rate: e.target.value })}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))]"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-[hsl(var(--border))] mt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="border border-[hsl(var(--border))]">
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditEmployeeModal;