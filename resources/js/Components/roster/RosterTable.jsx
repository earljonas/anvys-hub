import React from 'react';
import { Edit2, Archive, ChevronLeft, ChevronRight } from 'lucide-react';

const StatusBadge = ({ status }) => {
    let colorClass = "";

    switch (status.toLowerCase()) {
        case 'active':
            colorClass = "bg-emerald-100 text-emerald-700";
            break;
        case 'inactive':
            colorClass = "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]";
            break;
        default:
            colorClass = "bg-gray-100 text-gray-700";
    }

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${colorClass}`}>
            {status}
        </span>
    );
};

const RosterTable = ({ employees, pagination, onPageChange, onEdit, onArchive, onView }) => {
    return (
        <div className="bg-white rounded-xl border border-[hsl(var(--border))] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
                            <th className="text-left py-4 px-6 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Name</th>
                            <th className="text-left py-4 px-6 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Position</th>
                            <th className="text-left py-4 px-6 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Location</th>
                            <th className="text-left py-4 px-6 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Status</th>
                            <th className="text-right py-4 px-6 text-sm font-semibold text-[hsl(var(--muted-foreground))]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[hsl(var(--border))]">
                        {employees.length > 0 ? (
                            employees.map((employee) => (
                                <tr
                                    key={employee.id}
                                    className="hover:bg-[hsl(var(--sidebar-accent))] transition-colors cursor-pointer"
                                    onClick={() => onView(employee)}
                                >
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-[hsl(var(--foreground))]">{employee.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-[hsl(var(--foreground))]">{employee.position}</td>
                                    <td className="py-4 px-6 text-sm text-[hsl(var(--muted-foreground))]">{employee.location}</td>
                                    <td className="py-4 px-6">
                                        <StatusBadge status={employee.status} />
                                    </td>
                                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => onEdit(employee)}
                                                className="p-2 hover:bg-[hsl(var(--muted))] rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => onArchive(employee)}
                                                className="p-2 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-600 transition-colors"
                                                title="Archive"
                                            >
                                                <Archive size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-8 text-center text-[hsl(var(--muted-foreground))]">
                                    No employees found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[hsl(var(--border))]">
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                    Showing page <span className="font-medium text-[hsl(var(--foreground))]">{pagination.currentPage}</span> of <span className="font-medium text-[hsl(var(--foreground))]">{pagination.totalPages}</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onPageChange(Math.max(1, pagination.currentPage - 1))}
                        disabled={pagination.currentPage === 1}
                        className="p-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="p-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RosterTable;