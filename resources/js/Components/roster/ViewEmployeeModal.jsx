import React from 'react';
import { X, User, MapPin, Mail, Phone, Briefcase, CreditCard, Edit2 } from 'lucide-react';

const ViewEmployeeModal = ({ isOpen, onClose, employee, onEdit }) => {
    if (!isOpen || !employee) return null;

    const DetailItem = ({ icon: Icon, label, value, className = "" }) => (
        <div className={`flex items-start gap-3 p-3 rounded-lg bg-[hsl(var(--muted))] ${className}`}>
            <div className="p-2 rounded-md text-[hsl(var(--muted-foreground))]">
                <Icon size={18} />
            </div>
            <div>
                <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))] mt-0.5">{value || "N/A"}</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 overflow-hidden border border-[hsl(var(--border))]">
                <div className="flex justify-between items-center p-4 border-b border-[hsl(var(--border))]">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-[hsl(var(--primary-foreground))] font-bold text-lg">
                            {employee.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">{employee.name}</h3>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">ID: {employee.employeeId}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-[hsl(var(--muted))] cursor-pointer rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <DetailItem icon={Briefcase} label="Position" value={employee.position} />
                        <DetailItem icon={MapPin} label="Location" value={employee.location} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <DetailItem icon={Phone} label="Contact" value={employee.contactNumber} />
                        <DetailItem icon={Mail} label="Email" value={employee.email} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <DetailItem icon={CreditCard} label="Rate (per day)" value={`${employee.rate}`} />
                        <div className="flex items-center justify-center p-3 rounded-lg border-2 border-dashed border-[hsl(var(--border))]">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium 
                                ${employee.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                                    employee.status === 'Inactive' ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-700'}`}>
                                {employee.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* New Footer with Edit Button */}
                <div className="p-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 flex justify-end">
                    <button
                        onClick={() => {
                            onEdit(employee);
                            onClose();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity font-medium cursor-pointer"
                    >
                        Edit Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewEmployeeModal;