import React, { useState, useEffect, useMemo } from 'react';
import {
    X, User, MapPin, Phone, Package, Calendar, Clock, Users,
    Edit2, CreditCard, XCircle, History, AlertCircle, FileText, Receipt
} from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

// --- Sub-Components for Cleanliness ---

const StatusBadge = ({ status }) => {
    const config = {
        'CANCELLED': 'bg-red-100 text-red-700 border-red-200',
        'ACTIVE': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'PENDING': 'bg-blue-100 text-blue-700 border-blue-200'
    };
    const styles = config[status] || config['ACTIVE'];

    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles}`}>
            {status || 'ACTIVE'}
        </span>
    );
};

const PaymentBadge = ({ status }) => {
    const config = {
        'PAID': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'PARTIAL': 'bg-amber-100 text-amber-700 border-amber-200',
        'UNPAID': 'bg-slate-100 text-slate-600 border-slate-200'
    };

    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${config[status] || config['UNPAID']}`}>
            {status || 'UNPAID'}
        </span>
    );
};

// A smart wrapper to handle the "View vs Edit" logic centrally
const FormField = ({ label, icon: Icon, isView, valueDisplay, children, required }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
            {Icon && <Icon size={14} />}
            {label}
            {!isView && required && <span className="text-red-500">*</span>}
        </label>
        {isView ? (
            <div className="text-[hsl(var(--foreground))] font-medium py-2 px-1 border-b border-transparent">
                {valueDisplay || '-'}
            </div>
        ) : (
            children
        )}
    </div>
);

// --- Main Component ---

const EventModal = ({
    isOpen, onClose, mode, event, selectedDate,
    onSave, packages = [], onAddPayment, onCancelEvent
}) => {
    const [currentMode, setCurrentMode] = useState(mode);
    const [activeTab, setActiveTab] = useState('details'); // 'details' | 'billing'
    const [formData, setFormData] = useState({
        customerName: '', address: '', contactNumber: '',
        packageId: '', eventDate: '', eventTime: '12:00',
        extraGuests: 0, totalPrice: 0
    });
    const [error, setError] = useState(null);

    // Today's date in YYYY-MM-DD (used for min date constraint)
    const today = new Date().toLocaleDateString('en-CA');

    // Derived State
    const isView = currentMode === 'view' || currentMode === 'view-only';
    const isAddMode = mode === 'add';
    const isEditMode = currentMode === 'edit';
    const isCancelled = event?.status === 'CANCELLED';

    // Permission Checks
    const permissions = useMemo(() => ({
        canEdit: isView && !isCancelled && currentMode !== 'view-only',
        canAddPayment: isView && !isCancelled && event?.paymentStatus !== 'PAID',
        canCancel: isView && !isCancelled && currentMode !== 'view-only'
    }), [isView, isCancelled, currentMode, event]);

    // Initialize Data
    useEffect(() => {
        if (!isOpen) return;
        try {
            setCurrentMode(mode);
            setError(null);
            setActiveTab('details'); // Reset tab on open

            if (mode === 'add') {
                const defaultPackage = packages?.[0];
                setFormData({
                    customerName: '', address: '', contactNumber: '',
                    packageId: defaultPackage?.id || '',
                    eventDate: selectedDate ? new Date(selectedDate).toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA'),
                    eventTime: '12:00',
                    extraGuests: 0,
                    totalPrice: defaultPackage ? (parseFloat(defaultPackage.price) || 0) : 0
                });
            } else if (event) {
                setFormData({ ...event });
            }
        } catch (e) {
            console.error('Modal Init Error', e);
            setError('Failed to initialize form.');
        }
    }, [isOpen, mode, event, selectedDate, packages]);

    // Price Calculation Effect
    useEffect(() => {
        if (!formData.packageId || !packages?.length) return;
        const selectedPkg = packages.find(p => p.id == formData.packageId);
        if (selectedPkg) {
            const basePrice = parseFloat(selectedPkg.price) || 0;
            const extraRate = parseFloat(selectedPkg.extraGuestPrice) || 0;
            const extraCost = (parseInt(formData.extraGuests) || 0) * extraRate;

            // Only auto-update price if in Add/Edit mode to prevent overriding historical data in View mode accidentally
            if (!isView) {
                setFormData(prev => ({ ...prev, totalPrice: basePrice + extraCost }));
            }
        }
    }, [formData.packageId, formData.extraGuests, packages, isView]);

    const handleSave = () => {
        if (!formData.customerName || !formData.eventDate) {
            alert("Please fill in required fields");
            return;
        }
        if (formData.eventDate < today) {
            setError('Cannot book an event on a past date. Please select today or a future date.');
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;
    if (error) return <ErrorView message={error} onClose={onClose} />;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all">
            <div className={`bg-[hsl(var(--card))] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[hsl(var(--border))] ${isCancelled ? 'opacity-90 grayscale-[0.5]' : ''}`}>

                {/* --- Header --- */}
                <div className="flex justify-between items-start p-6 pb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] tracking-tight">
                            {isAddMode ? 'New Reservation' : isEditMode ? 'Modify Booking' : 'Event Details'}
                        </h2>
                        <div className="flex items-center gap-2 mt-2 h-6">
                            {isView && event && (
                                <>
                                    <StatusBadge status={event.status} />
                                    <div className="w-px h-4 bg-[hsl(var(--border))]" />
                                    <PaymentBadge status={event.paymentStatus} />
                                </>
                            )}
                            {isEditMode && <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Editing Mode</span>}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* --- Tabs --- */}
                <div className="px-6 mt-4 border-b border-[hsl(var(--border))]">
                    <div className="flex gap-6">
                        <TabButton
                            active={activeTab === 'details'}
                            onClick={() => setActiveTab('details')}
                            icon={FileText}
                            label="Booking Details"
                        />
                        <TabButton
                            active={activeTab === 'billing'}
                            onClick={() => setActiveTab('billing')}
                            icon={Receipt}
                            label="Billing & Payments"
                        />
                    </div>
                </div>

                {/* --- Scrollable Content --- */}
                <div className="overflow-y-auto flex-1 p-6">
                    {activeTab === 'details' ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Customer Info */}
                            <Section title="Customer Information">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <FormField label="Customer Name" icon={User} isView={isView} valueDisplay={formData.customerName} required>
                                            <Input
                                                value={formData.customerName}
                                                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                                placeholder="Enter full name"
                                            />
                                        </FormField>
                                    </div>
                                    <FormField label="Contact Number" icon={Phone} isView={isView} valueDisplay={formData.contactNumber}>
                                        <Input
                                            value={formData.contactNumber}
                                            onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                                            placeholder="09XX XXX XXXX"
                                        />
                                    </FormField>
                                    <FormField label="Address" icon={MapPin} isView={isView} valueDisplay={formData.address}>
                                        <Input
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Street, City"
                                        />
                                    </FormField>
                                </div>
                            </Section>

                            {/* Event Details */}
                            <Section title="Event Configuration">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="Selected Package" icon={Package} isView={isView}
                                        valueDisplay={packages?.find(p => p.id == formData.packageId)?.name} required>
                                        <select
                                            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm focus:ring-2 focus:ring-[hsl(var(--primary))]"
                                            value={formData.packageId}
                                            onChange={e => setFormData({ ...formData, packageId: e.target.value })}
                                        >
                                            <option value="">Select a Package</option>
                                            {packages?.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} (₱{parseFloat(p.price).toLocaleString()})</option>
                                            ))}
                                        </select>
                                    </FormField>

                                    <FormField label="Extra Guests" icon={Users} isView={isView} valueDisplay={`${formData.extraGuests} pax`}>
                                        <Input
                                            type="number" min="0"
                                            value={formData.extraGuests}
                                            onChange={e => setFormData({ ...formData, extraGuests: e.target.value })}
                                        />
                                    </FormField>

                                    <FormField label="Event Date" icon={Calendar} isView={isView} valueDisplay={formData.eventDate} required>
                                        <Input
                                            type="date"
                                            value={formData.eventDate}
                                            min={today}
                                            onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                                        />
                                    </FormField>

                                    <FormField label="Event Time" icon={Clock} isView={isView} valueDisplay={formData.eventTime} required>
                                        <Input
                                            type="time"
                                            value={formData.eventTime}
                                            onChange={e => setFormData({ ...formData, eventTime: e.target.value })}
                                        />
                                    </FormField>
                                </div>
                            </Section>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Price Card */}
                            <div className="bg-gradient-to-br from-[hsl(var(--primary))/5] to-[hsl(var(--primary))/15] rounded-xl p-6 border border-[hsl(var(--primary))/20] relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Receipt size={120} />
                                </div>
                                <div className="relative z-10 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs font-bold text-[hsl(var(--primary))] uppercase tracking-wider mb-1">Total Price</p>
                                        <h3 className="text-4xl font-black text-[hsl(var(--foreground))]">
                                            ₱{(formData.totalPrice || 0).toLocaleString()}
                                        </h3>
                                    </div>

                                    {isView && event && (
                                        <div className="text-right">
                                            <div className="mb-2">
                                                <span className="text-xs uppercase font-bold text-[hsl(var(--muted-foreground))]">Paid</span>
                                                <p className="text-xl font-bold text-emerald-600">₱{(event.totalPaid || 0).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs uppercase font-bold text-[hsl(var(--muted-foreground))]">Balance</span>
                                                <p className={`text-xl font-bold ${((event.totalPrice || 0) - (event.totalPaid || 0)) > 0 ? 'text-amber-600' : 'text-[hsl(var(--muted-foreground))]'}`}>
                                                    ₱{((event.totalPrice || 0) - (event.totalPaid || 0)).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment History Table */}
                            {isView && (
                                <div className="mt-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
                                            <History size={16} /> Transaction History
                                        </h4>
                                        {permissions.canAddPayment && (
                                            <Button variant="outline" size="sm" onClick={() => onAddPayment(event)} className="h-8 text-xs">
                                                <CreditCard size={12} className="mr-2" /> Add Payment
                                            </Button>
                                        )}
                                    </div>

                                    <div className="border border-[hsl(var(--border))] rounded-lg overflow-hidden bg-[hsl(var(--background))]">
                                        {event?.payments?.length > 0 ? (
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-[hsl(var(--muted))/50] text-[hsl(var(--muted-foreground))] border-b border-[hsl(var(--border))]">
                                                    <tr>
                                                        <th className="px-4 py-3 font-medium">Date Recorded</th>
                                                        <th className="px-4 py-3 font-medium">Notes</th>
                                                        <th className="px-4 py-3 font-medium text-right">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[hsl(var(--border))]">
                                                    {event.payments.map((p, i) => (
                                                        <tr key={i} className="hover:bg-[hsl(var(--muted))/20]">
                                                            <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{p.createdAt}</td>
                                                            <td className="px-4 py-3">{p.notes || '-'}</td>
                                                            <td className="px-4 py-3 text-right font-medium text-emerald-600">+₱{(p.amount || 0).toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">
                                                No payments recorded yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* --- Footer / Actions --- */}
                <div className="p-5 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))/20] flex flex-col sm:flex-row gap-3 sm:justify-between items-center">
                    <div className="w-full sm:w-auto">
                        {permissions.canCancel && (
                            <Button
                                variant="ghost"
                                className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                    if (confirm('Cancel this event?')) onCancelEvent(event.id);
                                }}
                            >
                                <XCircle size={16} className="mr-2" /> Cancel Event
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                        {!isView ? (
                            <>
                                <Button variant="ghost" onClick={onClose} className="flex-1 sm:flex-none cursor-pointer">Discard</Button>
                                <Button variant="primary" onClick={handleSave} className="flex-1 sm:flex-none cursor-pointer">
                                    {isAddMode ? 'Confirm Booking' : 'Save Changes'}
                                </Button>
                            </>
                        ) : (
                            permissions.canEdit && (
                                <Button variant="primary" onClick={() => setCurrentMode('edit')} className="w-full sm:w-auto">
                                    <Edit2 size={16} className="mr-2" /> Edit Details
                                </Button>
                            )
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

// --- Helper Components ---

const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`
            pb-3 px-2 text-sm font-medium border-b-2 transition-all flex items-center gap-2
            ${active
                ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}
        `}
    >
        <Icon size={16} /> {label}
    </button>
);

const Section = ({ title, children }) => (
    <div className="space-y-4">
        <h4 className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider border-l-2 border-[hsl(var(--primary))] pl-3">
            {title}
        </h4>
        {children}
    </div>
);

const ErrorView = ({ message, onClose }) => (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-red-400 via-red-500 to-rose-500" />

            <div className="p-7 flex flex-col items-center text-center">
                {/* Icon badge */}
                <div className="w-16 h-16 rounded-full bg-red-50 border-4 border-red-100 flex items-center justify-center mb-5 shadow-inner">
                    <AlertCircle className="text-red-500" size={32} strokeWidth={2.5} />
                </div>

                {/* Text */}
                <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2 tracking-tight">
                    Date Unavailable
                </h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-7">
                    Reservations cannot be made for dates that have already passed. Please choose today or an upcoming date to proceed with your booking.
                </p>

                {/* Action button */}
                <button
                    onClick={onClose}
                    className="w-full py-2.5 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-sm cursor-pointer"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
);

export default EventModal;