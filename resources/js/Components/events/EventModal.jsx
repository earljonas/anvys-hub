import React, { useState, useEffect } from 'react';
import { X, User, MapPin, Phone, Package, Calendar, Clock, Users, CreditCard, Edit2 } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

const PACKAGES = [
    { id: 'sweet', name: 'Sweet Celebration', price: 4200, capacity: 60, extraRate: 70 },
    { id: 'grand', name: 'Grand Fiesta', price: 5250, capacity: 75, extraRate: 70 },
    { id: 'ultimate', name: 'Ultimate Party', price: 6800, capacity: 100, extraRate: 68 },
];

const EventModal = ({ isOpen, onClose, mode, event, selectedDate, onSave }) => {
    const [currentMode, setCurrentMode] = useState(mode);
    const [formData, setFormData] = useState({
        customerName: '',
        address: '',
        contactNumber: '',
        packageId: 'sweet',
        eventDate: '',
        eventTime: '12:00',
        extraGuests: 0,
        totalPrice: 4200,
        paymentStatus: 'Pending'
    });

    useEffect(() => {
        setCurrentMode(mode);
        if (isOpen) {
            if (mode === 'add') {
                const dateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
                setFormData({
                    customerName: '',
                    address: '',
                    contactNumber: '',
                    packageId: 'sweet',
                    eventDate: dateStr,
                    eventTime: '12:00',
                    extraGuests: 0,
                    totalPrice: 4200,
                    paymentStatus: 'Pending'
                });
            } else if (event) {
                setFormData({ ...event });
            }
        }
    }, [isOpen, mode, event, selectedDate]);

    useEffect(() => {
        const selectedPkg = PACKAGES.find(p => p.id === formData.packageId);
        if (selectedPkg) {
            const basePrice = selectedPkg.price;
            const extraCost = (parseInt(formData.extraGuests) || 0) * selectedPkg.extraRate;
            setFormData(prev => ({ ...prev, totalPrice: basePrice + extraCost }));
        }
    }, [formData.packageId, formData.extraGuests]);

    if (!isOpen) return null;

    const isView = currentMode === 'view' || currentMode === 'view-only';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[hsl(var(--card))] rounded-[var(--radius)] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-[hsl(var(--border))] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-[hsl(var(--border))] shrink-0">
                    <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">
                        {isView ? 'Reservation Details' : mode === 'add' ? 'New Event Booking' : 'Edit Booking'}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-[hsl(var(--muted))] rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] flex items-center gap-2 mb-1">
                                    <User size={14} /> Customer Name
                                </label>
                                {isView ? <p className="font-semibold text-lg">{formData.customerName}</p> :
                                    <Input value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} placeholder="Full Name" required />}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] flex items-center gap-2 mb-1">
                                    <Phone size={14} /> Contact Number
                                </label>
                                {isView ? <p className="font-medium">{formData.contactNumber}</p> :
                                    <Input value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} placeholder="09XX XXX XXXX" />}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] flex items-center gap-2 mb-1">
                                    <MapPin size={14} /> Event Address
                                </label>
                                {isView ? <p className="font-medium">{formData.address}</p> :
                                    <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Street, City" />}
                            </div>
                        </div>

                        <hr className="border-[hsl(var(--border))]" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] flex items-center gap-2 mb-1">
                                    <Package size={14} /> Select Package
                                </label>
                                {isView ? (
                                    <p className="font-semibold text-[hsl(var(--primary))]">
                                        {PACKAGES.find(p => p.id === formData.packageId)?.name}
                                    </p>
                                ) : (
                                    <select
                                        className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] px-3 py-2 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))]"
                                        value={formData.packageId}
                                        onChange={e => setFormData({ ...formData, packageId: e.target.value })}
                                    >
                                        {PACKAGES.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} (₱{p.price})</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] flex items-center gap-2 mb-1">
                                    <Users size={14} /> Extra Guests
                                </label>
                                {isView ? <p className="font-medium">{formData.extraGuests} pax</p> :
                                    <Input type="number" value={formData.extraGuests} onChange={e => setFormData({ ...formData, extraGuests: e.target.value })} min="0" />}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] flex items-center gap-2 mb-1">
                                    <Calendar size={14} /> Event Date
                                </label>
                                {isView ? <p className="font-medium">{formData.eventDate}</p> :
                                    <Input type="date" value={formData.eventDate} onChange={e => setFormData({ ...formData, eventDate: e.target.value })} />}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] flex items-center gap-2 mb-1">
                                    <Clock size={14} /> Event Time
                                </label>
                                {isView ? <p className="font-medium">{formData.eventTime}</p> :
                                    <Input type="time" value={formData.eventTime} onChange={e => setFormData({ ...formData, eventTime: e.target.value })} />}
                            </div>
                        </div>

                        <div className="bg-[hsl(var(--muted))/30] p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 border border-[hsl(var(--border))]">
                            <div>
                                <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase font-bold tracking-wider">Total Price</p>
                                <p className="text-3xl font-black text-[hsl(var(--foreground))]">₱{formData.totalPrice.toLocaleString()}</p>
                            </div>
                            <div className="w-full md:w-auto">
                                <label className="text-xs text-[hsl(var(--muted-foreground))] uppercase font-bold mb-1 block text-center md:text-left">Payment Status</label>
                                {isView ? (
                                    <span className={`px-4 py-1 rounded-full text-sm font-bold flex items-center justify-center gap-2 ${formData.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        <CreditCard size={14} /> {formData.paymentStatus}
                                    </span>
                                ) : (
                                    <select
                                        className="w-full rounded-md border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm font-bold"
                                        value={formData.paymentStatus}
                                        onChange={e => setFormData({ ...formData, paymentStatus: e.target.value })}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Partial">Partial</option>
                                        <option value="Paid">Paid</option>
                                    </select>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 border-t border-[hsl(var(--border))] flex justify-end gap-3 shrink-0">
                    <Button variant="ghost" onClick={onClose}>
                        {currentMode.includes('view') ? 'Close' : 'Cancel'}
                    </Button>
                    {currentMode === 'view' && (
                        <Button variant="primary" onClick={() => setCurrentMode('edit')} className="flex items-center gap-2">
                            <Edit2 size={16} /> Edit Details
                        </Button>
                    )}
                    {currentMode === 'edit' || currentMode === 'add' ? (
                        <Button variant="primary" onClick={() => { onSave(formData); }}>
                            {mode === 'add' ? 'Confirm Booking' : 'Save Changes'}
                        </Button>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default EventModal;