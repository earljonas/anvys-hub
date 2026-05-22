import React from 'react';
import { Check, X } from 'lucide-react';

const PasswordStrengthIndicator = ({ password }) => {
    // Validation rules
    const rules = [
        { id: 'length', label: 'At least 8 characters', regex: /.{8,}/ },
        { id: 'uppercase', label: 'One uppercase letter', regex: /[A-Z]/ },
        { id: 'lowercase', label: 'One lowercase letter', regex: /[a-z]/ },
        { id: 'number', label: 'One number', regex: /[0-9]/ },
        { id: 'special', label: 'One special character', regex: /[^A-Za-z0-9]/ },
    ];

    // If password is empty, don't show the checklist to keep UI clean initially
    if (!password) {
        return null;
    }

    return (
        <div className="mt-2 p-3 bg-gray-50 border border-[hsl(var(--border))] rounded-lg">
            <p className="text-xs font-medium text-gray-700 mb-2">Password Requirements:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {rules.map((rule) => {
                    const isMet = rule.regex.test(password);
                    return (
                        <div key={rule.id} className="flex items-center gap-2 text-sm">
                            {isMet ? (
                                <Check size={14} className="text-green-600" />
                            ) : (
                                <X size={14} className="text-gray-400" />
                            )}
                            <span className={isMet ? 'text-green-700 font-medium' : 'text-gray-500'}>
                                {rule.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PasswordStrengthIndicator;
