import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { LayoutDashboard, History, Filter, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/common/Button';
import Input from '@/Components/common/Input';

const AuditLogs = ({ logs, filters }) => {
    const [actionFilter, setActionFilter] = useState(filters.action || 'all');
    const [typeFilter, setTypeFilter] = useState(filters.subject_type || 'all');

    const handleActionChange = (e) => {
        const val = e.target.value;
        setActionFilter(val);
        router.get(route('admin.reports.audit'), {
            action: val,
            subject_type: typeFilter,
        }, { preserveState: true, replace: true });
    };

    const handleTypeChange = (e) => {
        const val = e.target.value;
        setTypeFilter(val);
        router.get(route('admin.reports.audit'), {
            action: actionFilter,
            subject_type: val,
        }, { preserveState: true, replace: true });
    };

    const getActionBadge = (action) => {
        const styles = {
            created: 'bg-green-100 text-green-700',
            updated: 'bg-blue-100 text-blue-700',
            deleted: 'bg-red-100 text-red-700',
        };
        return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${styles[action] || 'bg-gray-100 text-gray-700'}`}>
                {action}
            </span>
        );
    };

    const renderJsonDiff = (oldVals, newVals) => {
        if (!oldVals && !newVals) return <span className="text-gray-400 italic">No changes recorded</span>;
        
        return (
            <div className="text-xs font-mono space-y-1">
                {oldVals && (
                    <div className="bg-red-50 text-red-600 p-2 rounded border border-red-100">
                        <span className="font-bold block mb-1">Before:</span>
                        <pre className="whitespace-pre-wrap">{JSON.stringify(oldVals, null, 2)}</pre>
                    </div>
                )}
                {newVals && (
                    <div className="bg-green-50 text-green-600 p-2 rounded border border-green-100 mt-2">
                        <span className="font-bold block mb-1">After:</span>
                        <pre className="whitespace-pre-wrap">{JSON.stringify(newVals, null, 2)}</pre>
                    </div>
                )}
            </div>
        );
    };

    return (
        <AdminLayout>
            <Head title="Audit Logs" />

            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[hsl(var(--foreground))] flex items-center gap-3">
                            <History className="w-8 h-8 text-[hsl(var(--primary))]" />
                            Comprehensive Audit Logs
                        </h1>
                        <p className="text-[hsl(var(--muted-foreground))] mt-1">
                            Immutable history of all system modifications.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-[hsl(var(--border))] overflow-hidden">
                    
                    {/* Filters */}
                    <div className="p-4 border-b border-[hsl(var(--border))] bg-gray-50 flex gap-4 items-end">
                        <div className="flex-1 max-w-xs">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                            <select 
                                value={actionFilter} 
                                onChange={handleActionChange}
                                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-primary focus:border-primary sm:text-sm"
                            >
                                <option value="all">All Actions</option>
                                <option value="created">Created</option>
                                <option value="updated">Updated</option>
                                <option value="deleted">Deleted</option>
                            </select>
                        </div>
                        <div className="flex-1 max-w-xs">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Record Type</label>
                            <select 
                                value={typeFilter} 
                                onChange={handleTypeChange}
                                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-primary focus:border-primary sm:text-sm"
                            >
                                <option value="all">All Records</option>
                                <option value="Employee">Employee</option>
                                <option value="User">User</option>
                                <option value="Payroll">Payroll</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-[hsl(var(--border))]">
                                    <th className="p-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Date & Time</th>
                                    <th className="p-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Admin User</th>
                                    <th className="p-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Action</th>
                                    <th className="p-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Record</th>
                                    <th className="p-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Changes Made</th>
                                    <th className="p-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[hsl(var(--border))]">
                                {logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {log.created_at}
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{log.user}</div>
                                            <div className="text-xs text-gray-500">{log.user_email}</div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            {getActionBadge(log.action)}
                                        </td>
                                        <td className="p-4 whitespace-nowrap text-sm">
                                            <span className="font-semibold text-gray-700">{log.subject_type}</span>
                                            <span className="text-gray-500 ml-1">#{log.subject_id}</span>
                                        </td>
                                        <td className="p-4 min-w-[300px] max-w-md">
                                            {renderJsonDiff(log.old_values, log.new_values)}
                                        </td>
                                        <td className="p-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                            {log.ip_address}
                                        </td>
                                    </tr>
                                ))}
                                {logs.data.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-[hsl(var(--muted-foreground))]">
                                            No audit logs found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {logs.data.length > 0 && (
                        <div className="p-4 border-t border-[hsl(var(--border))] flex items-center justify-between">
                            <span className="text-sm text-[hsl(var(--muted-foreground))]">
                                Showing <span className="font-medium text-[hsl(var(--foreground))]">{logs.from}</span> to <span className="font-medium text-[hsl(var(--foreground))]">{logs.to}</span> of <span className="font-medium text-[hsl(var(--foreground))]">{logs.total}</span> logs
                            </span>
                            <div className="flex gap-2">
                                {logs.links.map((link, i) => (
                                    <button
                                        key={i}
                                        onClick={() => link.url && router.get(link.url)}
                                        disabled={!link.url || link.active}
                                        className={`px-3 py-1 rounded-md text-sm transition-colors ${
                                            link.active 
                                            ? 'bg-[hsl(var(--primary))] text-white font-medium shadow-sm' 
                                            : link.url 
                                                ? 'bg-white text-[hsl(var(--foreground))] hover:bg-gray-100 border border-[hsl(var(--border))]' 
                                                : 'text-gray-300 cursor-not-allowed hidden'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AuditLogs;
