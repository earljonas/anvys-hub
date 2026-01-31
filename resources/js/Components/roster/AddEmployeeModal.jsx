import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

const AddEmployeeModal = ({ isOpen, onClose, onSave, locations = [] }) => {
    const initialFormState = {
        name: '',
        position: '',
        locationId: '',
        email: '',
        contactNumber: '',
        rate: '',
        status: 'Active',
        employeeId: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (isOpen) {
            const randomId = `EMP-${Math.floor(100 + Math.random() * 900)}`;
            setFormData(prev => ({ ...initialFormState, employeeId: randomId }));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        const newEmployee = {
            ...formData,
            id: Date.now(),
        };

        onSave(newEmployee);
        setFormData(initialFormState);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-4 overflow-hidden border border-[hsl(var(--border))]">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-[hsl(var(--border))]">
                    <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Add New Employee</h3>
                    <button onClick={onClose} className="p-1 hover:bg-[hsl(var(--muted))] rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1">Employee ID</label>
                        <Input
                            value={formData.employeeId}
                            disabled
                            className="bg-[hsl(var(--muted))] opacity-75 cursor-not-allowed"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Full Name</label>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Juan dela Cruz"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Position</label>
                            <Input
                                value={formData.position}
                                onChange={e => setFormData({ ...formData, position: e.target.value })}
                                placeholder="e.g. Cashier"
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
                                placeholder="0917..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Email</label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="email@example.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Location</label>
                            <select
                                value={formData.locationId}
                                onChange={e => setFormData({ ...formData, locationId: e.target.value })}
                                className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))]"
                            >
                                <option value="">Select Location</option>
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Rate</label>
                            <Input
                                type="number"
                                value={formData.rate}
                                onChange={e => setFormData({ ...formData, rate: e.target.value })}
                                placeholder="0.00"
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

                    {/* Footer / Buttons */}
                    <div className="pt-4 flex justify-end gap-3 border-t border-[hsl(var(--border))] mt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="border border-[hsl(var(--border))]">
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary">
                            Add Employee
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEmployeeModal;