import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

const EditItemModal = ({ isOpen, onClose, item, onSave, locations = [] }) => {
    const [formData, setFormData] = useState({
        name: '',
        locationId: '',
        minStock: '',
        unit: 'pcs',
        costPerUnit: ''
    });

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '',
                locationId: item.locationId?.toString() || '',
                minStock: item.minStock?.toString() || '',
                unit: item.unit || 'pcs',
                costPerUnit: item.costPerUnit?.toString() || ''
            });
        }
    }, [item]);

    if (!isOpen || !item) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            id: item.id,
            name: formData.name,
            locationId: formData.locationId === '' ? null : parseInt(formData.locationId),
            minStock: parseInt(formData.minStock) || 0,
            unit: formData.unit,
            costPerUnit: parseFloat(formData.costPerUnit) || 0,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden border border-[hsl(var(--border))]">
                <div className="flex justify-between items-center p-4 border-b border-[hsl(var(--border))]">
                    <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Edit Item</h3>
                    <button onClick={onClose} className="p-1 hover:bg-[hsl(var(--muted))] rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Item Name</label>
                        <Input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* Current Stock - Display Only */}
                    <div className="bg-[hsl(var(--muted))] rounded-lg p-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Current Stock</span>
                            <span className="text-lg font-bold text-[hsl(var(--foreground))]">{item.stock} {item.unit}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Minimum Stock</label>
                            <Input
                                type="number"
                                required
                                min="0"
                                value={formData.minStock}
                                onChange={e => setFormData({ ...formData, minStock: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Unit</label>
                            <Input
                                type="text"
                                placeholder="e.g. pcs, kg"
                                required
                                value={formData.unit}
                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Cost per Unit</label>
                        <Input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.costPerUnit}
                            onChange={e => setFormData({ ...formData, costPerUnit: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Location</label>
                        <select
                            required
                            className="w-full px-4 py-2 border border-[hsl(var(--border))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] bg-white text-[hsl(var(--foreground))]"
                            value={formData.locationId}
                            onChange={e => setFormData({ ...formData, locationId: e.target.value })}
                        >
                            <option value="">Select Location</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className='border border-[hsl(var(--muted))] cursor-pointer'
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                        >
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditItemModal;
