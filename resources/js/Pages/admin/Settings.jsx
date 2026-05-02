import React, { useRef } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Settings as SettingsIcon, ShieldCheck, KeyRound } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/common/Button';
import Input from '@/Components/common/Input';

const Settings = () => {
    const { flash } = usePage().props;
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, post, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const passwordsMatch = data.password && data.password_confirmation && data.password === data.password_confirmation;
    const passwordsMismatch = data.password && data.password_confirmation && data.password !== data.password_confirmation;

    const updatePassword = (e) => {
        e.preventDefault();

        if (passwordsMismatch) {
            return; // Don't submit if they don't match
        }

        post(route('admin.settings.password'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Settings" />

            <div className="p-6 max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black text-[hsl(var(--foreground))] flex items-center gap-3">
                        <SettingsIcon className="w-8 h-8 text-[hsl(var(--primary))]" />
                        System Settings
                    </h1>
                </div>

                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="font-medium">{flash.success}</span>
                    </div>
                )}

                {/* Change Password Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-[hsl(var(--border))] overflow-hidden">
                    <div className="p-6 border-b border-[hsl(var(--border))] bg-gray-50 flex items-center gap-3">
                        <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
                            <KeyRound size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Update Password</h2>
                        </div>
                    </div>

                    <div className="p-6">
                        <form onSubmit={updatePassword} className="space-y-6 max-w-xl">
                            <div>
                                <Input
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    type="password"
                                    label="Current Password"
                                    error={errors.current_password}
                                    placeholder="Enter your current password"
                                    className="block w-full"
                                    required
                                />
                            </div>

                            <div>
                                <Input
                                    id="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    type="password"
                                    label="New Password"
                                    error={errors.password}
                                    placeholder="Enter a new password"
                                    className="block w-full"
                                    required
                                />
                            </div>

                            <div>
                                <Input
                                    id="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    type="password"
                                    label="Confirm Password"
                                    error={passwordsMismatch ? "Passwords do not match." : errors.password_confirmation}
                                    placeholder="Confirm your new password"
                                    className={`block w-full ${passwordsMatch ? 'border-green-500 focus:ring-green-500' : ''}`}
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t border-[hsl(var(--border))]">
                                <Button disabled={processing || passwordsMismatch} type="submit" className="w-full sm:w-auto">
                                    {processing ? 'Saving...' : 'Save Password'}
                                </Button>

                                {recentlySuccessful && (
                                    <p className="text-sm text-green-600 font-medium">Saved successfully.</p>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Settings;
