import React, { useRef } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Settings as SettingsIcon, ShieldCheck, KeyRound, LockKeyhole } from 'lucide-react';
import StaffLayout from '@/Layouts/StaffLayout';
import Button from '@/Components/common/Button';
import Input from '@/Components/common/Input';
import PasswordStrengthIndicator from '@/Components/common/PasswordStrengthIndicator';

const Settings = () => {
    const { flash } = usePage().props;
    const passwordInput = useRef();
    const currentPasswordInput = useRef();
    const currentPasswordPinInput = useRef();
    const pinInput = useRef();

    // Password Form
    const { 
        data: pwdData, 
        setData: setPwdData, 
        errors: pwdErrors, 
        post: postPwd, 
        reset: resetPwd, 
        processing: pwdProcessing, 
        recentlySuccessful: pwdSuccessful 
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // PIN Form
    const { 
        data: pinData, 
        setData: setPinData, 
        errors: pinErrors, 
        post: postPin, 
        reset: resetPin, 
        processing: pinProcessing, 
        recentlySuccessful: pinSuccessful 
    } = useForm({
        current_password: '',
        clock_pin: '',
    });

    const passwordsMatch = pwdData.password && pwdData.password_confirmation && pwdData.password === pwdData.password_confirmation;
    const passwordsMismatch = pwdData.password && pwdData.password_confirmation && pwdData.password !== pwdData.password_confirmation;

    const updatePassword = (e) => {
        e.preventDefault();

        if (passwordsMismatch) {
            return;
        }

        postPwd(route('staff.settings.password'), {
            preserveScroll: true,
            onSuccess: () => resetPwd(),
            onError: (errors) => {
                if (errors.password) {
                    resetPwd('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    resetPwd('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    const updatePin = (e) => {
        e.preventDefault();

        postPin(route('staff.settings.pin'), {
            preserveScroll: true,
            onSuccess: () => resetPin(),
            onError: (errors) => {
                if (errors.clock_pin) {
                    resetPin('clock_pin');
                    pinInput.current.focus();
                }

                if (errors.current_password) {
                    resetPin('current_password');
                    currentPasswordPinInput.current.focus();
                }
            },
        });
    };

    return (
        <StaffLayout>
            <Head title="Account Settings" />

            <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black text-[hsl(var(--foreground))] flex items-center gap-3">
                        <SettingsIcon className="w-8 h-8 text-[hsl(var(--primary))]" />
                        Account Settings
                    </h1>
                </div>

                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm">
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
                                    value={pwdData.current_password}
                                    onChange={(e) => setPwdData('current_password', e.target.value)}
                                    type="password"
                                    label="Current Password"
                                    error={pwdErrors.current_password}
                                    placeholder="Enter your current password"
                                    className="block w-full"
                                    required
                                />
                            </div>

                            <div>
                                <Input
                                    id="password"
                                    ref={passwordInput}
                                    value={pwdData.password}
                                    onChange={(e) => setPwdData('password', e.target.value)}
                                    type="password"
                                    label="New Password"
                                    error={pwdErrors.password}
                                    placeholder="Enter a new password"
                                    className="block w-full"
                                    required
                                />
                                <PasswordStrengthIndicator password={pwdData.password} />
                            </div>

                            <div>
                                <Input
                                    id="password_confirmation"
                                    value={pwdData.password_confirmation}
                                    onChange={(e) => setPwdData('password_confirmation', e.target.value)}
                                    type="password"
                                    label="Confirm Password"
                                    error={passwordsMismatch ? "Passwords do not match." : pwdErrors.password_confirmation}
                                    placeholder="Confirm your new password"
                                    className={`block w-full ${passwordsMatch ? 'border-green-500 focus:ring-green-500' : ''}`}
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t border-[hsl(var(--border))]">
                                <Button disabled={pwdProcessing || passwordsMismatch} type="submit" className="w-full sm:w-auto">
                                    {pwdProcessing ? 'Saving...' : 'Save Password'}
                                </Button>

                                {pwdSuccessful && (
                                    <p className="text-sm text-green-600 font-medium animate-pulse">Saved successfully.</p>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Change Clock PIN Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-[hsl(var(--border))] overflow-hidden">
                    <div className="p-6 border-b border-[hsl(var(--border))] bg-gray-50 flex items-center gap-3">
                        <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
                            <LockKeyhole size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Clock-In PIN</h2>
                        </div>
                    </div>

                    <div className="p-6">
                        <form onSubmit={updatePin} className="space-y-6 max-w-xl">
                            <div>
                                <Input
                                    id="pin_current_password"
                                    ref={currentPasswordPinInput}
                                    value={pinData.current_password}
                                    onChange={(e) => setPinData('current_password', e.target.value)}
                                    type="password"
                                    label="Current Password"
                                    error={pinErrors.current_password}
                                    placeholder="Enter your current password to verify identity"
                                    className="block w-full"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    New 4-Digit PIN
                                </label>
                                <input
                                    id="clock_pin"
                                    ref={pinInput}
                                    value={pinData.clock_pin}
                                    onChange={(e) => setPinData('clock_pin', e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    type="password"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={4}
                                    placeholder="••••"
                                    required
                                    className={`w-full max-w-[200px] text-center text-3xl font-mono tracking-[0.5em] py-3 px-4 rounded-xl bg-gray-50 border ${pinErrors.clock_pin ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]'} text-gray-800 focus:outline-none focus:ring-2 transition-all`}
                                />
                                {pinErrors.clock_pin && (
                                    <p className="mt-2 text-sm text-red-600 font-medium">{pinErrors.clock_pin}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t border-[hsl(var(--border))]">
                                <Button disabled={pinProcessing || pinData.clock_pin.length !== 4} type="submit" className="w-full sm:w-auto">
                                    {pinProcessing ? 'Saving...' : 'Save PIN'}
                                </Button>

                                {pinSuccessful && (
                                    <p className="text-sm text-green-600 font-medium animate-pulse">Saved successfully.</p>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </StaffLayout>
    );
};

export default Settings;
