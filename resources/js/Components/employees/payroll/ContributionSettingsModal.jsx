import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { X, FileText } from 'lucide-react';
import Input from '@/Components/employees/Input';
import Button from '@/Components/employees/Button';

const ContributionSettingsModal = ({ isOpen, onClose, employees = [] }) => {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const selectedEmployee = employees.find(e => e.id === parseInt(selectedEmployeeId));

    const { data, setData, put, processing, errors, reset } = useForm({
        tin_number: '',
        sss_number: '',
        philhealth_number: '',
        pagibig_number: '',
    });

    useEffect(() => {
        if (selectedEmployee) {
            setData({
                tin_number: selectedEmployee.employee_profile?.tin_number || '',
                sss_number: selectedEmployee.employee_profile?.sss_number || '',
                philhealth_number: selectedEmployee.employee_profile?.philhealth_number || '',
                pagibig_number: selectedEmployee.employee_profile?.pagibig_number || '',
            });
        } else {
            reset();
        }
    }, [selectedEmployeeId]);

    useEffect(() => {
        if (!isOpen) {
            setSelectedEmployeeId('');
            reset();
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedEmployeeId) return;

        put(route('admin.employees.contributions', selectedEmployeeId), {
            onSuccess: () => {
                onClose();
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden border border-[hsl(var(--border))]">
                <div className="flex justify-between items-center p-4 border-b border-[hsl(var(--border))]">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[hsl(var(--primary))]" />
                        <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Contribution Settings</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-[hsl(var(--muted))] rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Select Employee</label>
                        <select
                            required
                            className="w-full px-4 py-2 border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] bg-white text-[hsl(var(--foreground))]"
                            value={selectedEmployeeId}
                            onChange={e => setSelectedEmployeeId(e.target.value)}
                        >
                            <option value="">Select an employee...</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedEmployeeId && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">TIN Number</label>
                                    <Input
                                        placeholder="000-000-000-000"
                                        value={data.tin_number}
                                        onChange={e => setData('tin_number', e.target.value)}
                                        error={errors.tin_number}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">SSS Number</label>
                                    <Input
                                        placeholder="00-0000000-0"
                                        value={data.sss_number}
                                        onChange={e => setData('sss_number', e.target.value)}
                                        error={errors.sss_number}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">PhilHealth Number</label>
                                    <Input
                                        placeholder="00-000000000-0"
                                        value={data.philhealth_number}
                                        onChange={e => setData('philhealth_number', e.target.value)}
                                        error={errors.philhealth_number}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Pag-IBIG Number</label>
                                    <Input
                                        placeholder="0000-0000-0000"
                                        value={data.pagibig_number}
                                        onChange={e => setData('pagibig_number', e.target.value)}
                                        error={errors.pagibig_number}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <Button type="button" variant="ghost" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </>
                    )}

                    {!selectedEmployeeId && (
                        <div className="py-8 text-center text-[hsl(var(--muted-foreground))]">
                            <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">Select an employee to manage their contribution details</p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ContributionSettingsModal;
