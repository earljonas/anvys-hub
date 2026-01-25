import React, { useState, useEffect } from 'react';
import { X, MapPin, Store, CheckCircle, XCircle } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

const LocationModal = ({ isOpen, onClose, mode, location, onSave }) => {
    // Initial State
    const initialForm = {
        name: '',
        address: '',
        status: 'Active'
    };

    const [formData, setFormData] = useState(initialForm);

    // Reset or Populate form on open
    useEffect(() => {
        if (isOpen) {
            if (mode === 'add') {
                setFormData(initialForm);
            } else if (location) {
                setFormData({
                    name: location.name,
                    address: location.address,
                    status: location.status
                });
            }
        }
    }, [isOpen, mode, location]);

    if (!isOpen) return null;

    const isView = mode === 'view';
    const title = mode === 'add' ? 'Add New Location' : mode === 'edit' ? 'Edit Location' : location?.name;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, id: location?.id });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[hsl(var(--card))] rounded-[var(--radius)] shadow-lg w-full max-w-md mx-4 overflow-hidden border border-[hsl(var(--border))]">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-[hsl(var(--border))]">
                    <h3 className="text-xl font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
                        {isView && <Store className="text-[hsl(var(--primary))]" size={20} />}
                        {title}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-[hsl(var(--muted))] rounded-lg text-[hsl(var(--muted-foreground))] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Name Field */}
                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1">Location Name</label>
                        {isView ? (
                            <p className="text-[hsl(var(--foreground))] font-medium text-lg">{formData.name}</p>
                        ) : (
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. SM Mall Branch"
                                required
                            />
                        )}
                    </div>

                    {/* Address Field */}
                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1">Address</label>
                        {isView ? (
                            <div className="flex items-start gap-2 text-[hsl(var(--foreground))]">
                                <MapPin size={18} className="mt-0.5 text-[hsl(var(--muted-foreground))]" />
                                <span>{formData.address}</span>
                            </div>
                        ) : (
                            <Input
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Full address"
                                required
                            />
                        )}
                    </div>

                    {/* Status Field */}
                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-1">Status</label>
                        {isView ? (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-sm font-medium ${formData.status === 'Active'
                                ? 'bg-[hsl(var(--success))/10] text-[hsl(var(--success))]'
                                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                                }`}>
                                {formData.status === 'Active' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                {formData.status}
                            </span>
                        ) : (
                            <select
                                className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        )}
                    </div>

                    {/* Footer / Actions */}
                    <div className="pt-4 flex justify-end gap-3">
                        {isView ? (
                            <Button type="button" variant="primary" onClick={onClose}>Close</Button>
                        ) : (
                            <>
                                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                                <Button type="submit" variant="primary">
                                    {mode === 'add' ? 'Create Location' : 'Save Changes'}
                                </Button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LocationModal;