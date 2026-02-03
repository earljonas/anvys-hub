import React, { useState, useEffect } from 'react';
import { X, User, MapPin, Phone, Package, Calendar, Clock, Users, Edit2, DollarSign, XCircle, History } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

const EventModal = ({ isOpen, onClose, mode, event, selectedDate, onSave, packages = [], onAddPayment, onCancelEvent }) => {
    const [currentMode, setCurrentMode] = useState(mode);
    const [formData, setFormData] = useState({
        customerName: '',
        address: '',
        contactNumber: '',
        packageId: '',
        eventDate: '',
        eventTime: '12:00',
        extraGuests: 0,
        totalPrice: 0
    });

    useEffect(() => {
        setCurrentMode(mode);
        if (isOpen) {
            if (mode === 'add') {
                // Safe date string conversion using local timezone
                let dateStr;
                try {
                    const dateToUse = selectedDate instanceof Date && !isNaN(selectedDate)
                        ? selectedDate
                        : new Date();
                    // Use toLocaleDateString with 'en-CA' locale to get YYYY-MM-DD format in local time
                    dateStr = dateToUse.toLocaleDateString('en-CA');
                } catch (e) {
                    dateStr = new Date().toLocaleDateString('en-CA');
                }

                const defaultPackage = packages.length > 0 ? packages[0] : null;

                setFormData({
                    customerName: '',
                    address: '',
                    contactNumber: '',
                    packageId: defaultPackage ? defaultPackage.id : '',
                    eventDate: dateStr,
                    eventTime: '12:00',
                    extraGuests: 0,
                    totalPrice: defaultPackage ? parseFloat(defaultPackage.price) || 0 : 0
                });
            } else if (event) {
                setFormData({ ...event });
            }
        }
    }, [isOpen, mode, event, selectedDate, packages]);

    useEffect(() => {
        if (!formData.packageId) return;
        const selectedPkg = packages.find(p => p.id == formData.packageId);
        if (selectedPkg) {
            const basePrice = parseFloat(selectedPkg.price) || 0;
            const extraRate = parseFloat(selectedPkg.extraGuestPrice) || 0;
            const extraCost = (parseInt(formData.extraGuests) || 0) * extraRate;
            setFormData(prev => ({ ...prev, totalPrice: basePrice + extraCost }));
        }
    }, [formData.packageId, formData.extraGuests, packages]);

    if (!isOpen) return null;

    const isView = currentMode === 'view' || currentMode === 'view-only';
    const isCancelled = event?.status === 'CANCELLED';
    const canEdit = isView && !isCancelled && currentMode !== 'view-only';
    const canAddPayment = isView && !isCancelled;
    const canCancel = isView && !isCancelled && currentMode !== 'view-only';

    // Status badge styling
    const getStatusBadge = (status) => {
        if (status === 'CANCELLED') {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">CANCELLED</span>;
        }
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">ACTIVE</span>;
    };

    // Payment status badge styling
    const getPaymentStatusBadge = (status) => {
        switch (status) {
            case 'PAID':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">PAID</span>;
            case 'PARTIAL':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">PARTIAL</span>;
            default:
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">UNPAID</span>;
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={`bg-[hsl(var(--card))] rounded-[var(--radius)] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-[hsl(var(--border))] flex flex-col ${isCancelled ? 'opacity-90' : ''}`}>
                <div className="flex justify-between items-center p-4 border-b border-[hsl(var(--border))]">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold">
                            {isView ? 'Reservation Details' : mode === 'add' ? 'New Event Booking' : 'Edit Booking'}
                        </h3>
                        {isView && event && (
                            <>
                                {getStatusBadge(event.status)}
                                {getPaymentStatusBadge(event.paymentStatus)}
                            </>
                        )}
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-[hsl(var(--muted))]">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium flex items-center gap-2 mb-1">
                                    <User size={14} /> Customer Name
                                </label>
                                {isView ? (
                                    <p className="font-semibold text-lg">{formData.customerName}</p>
                                ) : (
                                    <Input
                                        value={formData.customerName}
                                        onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                        placeholder="Full Name"
                                        required
                                    />
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium flex items-center gap-2 mb-1">
                                    <Phone size={14} /> Contact Number
                                </label>
                                {isView ? (
                                    <p className="font-medium">{formData.contactNumber}</p>
                                ) : (
                                    <Input
                                        value={formData.contactNumber}
                                        onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                                        placeholder="09XX XXX XXXX"
                                    />
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium flex items-center gap-2 mb-1">
                                    <MapPin size={14} /> Event Address
                                </label>
                                {isView ? (
                                    <p className="font-medium">{formData.address}</p>
                                ) : (
                                    <Input
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Street, City"
                                    />
                                )}
                            </div>
                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium flex items-center gap-2 mb-1">
                                    <Package size={14} /> Select Package
                                </label>
                                {isView ? (
                                    <p className="font-semibold">
                                        {packages.find(p => p.id == formData.packageId)?.name || 'Unknown Package'}
                                    </p>
                                ) : (
                                    <select
                                        className="w-full rounded-md border border-[hsl(var(--border))] px-3 py-2 text-sm"
                                        value={formData.packageId}
                                        onChange={e => setFormData({ ...formData, packageId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Package</option>
                                        {packages.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} ({p.cupsCount} cups - ₱{parseFloat(p.price).toLocaleString()})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium flex items-center gap-2 mb-1">
                                    <Users size={14} /> Extra Guests
                                </label>
                                {isView ? (
                                    <p className="font-medium">{formData.extraGuests} pax</p>
                                ) : (
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formData.extraGuests}
                                        onChange={e => setFormData({ ...formData, extraGuests: e.target.value })}
                                    />
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium flex items-center gap-2 mb-1">
                                    <Calendar size={14} /> Event Date
                                </label>
                                {isView ? (
                                    <p className="font-medium">{formData.eventDate}</p>
                                ) : (
                                    <Input
                                        type="date"
                                        value={formData.eventDate}
                                        onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                                        required
                                    />
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium flex items-center gap-2 mb-1">
                                    <Clock size={14} /> Event Time
                                </label>
                                {isView ? (
                                    <p className="font-medium">{formData.eventTime}</p>
                                ) : (
                                    <Input
                                        type="time"
                                        value={formData.eventTime}
                                        onChange={e => setFormData({ ...formData, eventTime: e.target.value })}
                                        required
                                    />
                                )}
                            </div>
                        </div>

                        {/* Pricing Summary */}
                        <div className="p-4 rounded-xl flex border border-[hsl(var(--border))] justify-between items-center">
                            <div>
                                <p className="text-xs uppercase font-bold">Total Price</p>
                                <p className="text-3xl font-black">
                                    ₱{(formData.totalPrice || 0).toLocaleString()}
                                </p>
                            </div>
                            {isView && event && (
                                <div className="text-right">
                                    <p className="text-xs uppercase font-bold text-[hsl(var(--muted-foreground))]">Paid</p>
                                    <p className="text-xl font-bold text-green-600">
                                        ₱{(event.totalPaid || 0).toLocaleString()}
                                    </p>
                                    {(event.totalPrice - (event.totalPaid || 0)) > 0 && (
                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                            Balance: ₱{(event.totalPrice - (event.totalPaid || 0)).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Payment History Section - Only show in view mode */}
                        {isView && event?.payments && event.payments.length > 0 && (
                            <div className="border border-[hsl(var(--border))] rounded-xl overflow-hidden">
                                <div className="p-3 bg-[hsl(var(--muted))] flex items-center gap-2">
                                    <History size={16} />
                                    <span className="font-semibold text-sm">Payment History</span>
                                </div>
                                <div className="divide-y divide-[hsl(var(--border))]">
                                    {event.payments.map((payment, idx) => (
                                        <div key={payment.id || idx} className="p-3 flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-green-600">₱{(payment.amount || 0).toLocaleString()}</p>
                                                {payment.notes && (
                                                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{payment.notes}</p>
                                                )}
                                            </div>
                                            <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                                {payment.createdAt}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                <div className="p-4 border-t border-[hsl(var(--border))] flex justify-between gap-3">
                    <div>
                        {/* Cancel Event Button - Show on left side */}
                        {canCancel && onCancelEvent && (
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    if (confirm('Are you sure you want to cancel this event? This action cannot be undone.')) {
                                        onCancelEvent(event.id);
                                    }
                                }}
                                className="text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <XCircle size={16} /> Cancel Event
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={onClose}>
                            {currentMode.includes('view') ? 'Close' : 'Cancel'}
                        </Button>

                        {/* Add Payment Button */}
                        {canAddPayment && onAddPayment && event.paymentStatus !== 'PAID' && (
                            <Button
                                variant="secondary"
                                onClick={() => onAddPayment(event)}
                                className="flex items-center gap-2"
                            >
                                <DollarSign size={16} /> Add Payment
                            </Button>
                        )}

                        {canEdit && (
                            <Button variant="primary" onClick={() => setCurrentMode('edit')} className="flex items-center gap-2">
                                <Edit2 size={16} /> Edit Details
                            </Button>
                        )}

                        {(currentMode === 'edit' || currentMode === 'add') && (
                            <Button variant="primary" onClick={() => onSave(formData)}>
                                {mode === 'add' ? 'Confirm Booking' : 'Save Changes'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventModal;
