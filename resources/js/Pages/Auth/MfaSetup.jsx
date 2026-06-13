import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { QrCode, ShieldCheck, Loader2 } from 'lucide-react';
import Button from '../../Components/common/Button';
import Input from '../../Components/common/Input';

const MfaSetup = ({ qrCodeSvg, secret }) => {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('mfa.setup.confirm'));
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[hsl(var(--background))] relative overflow-hidden">
            <Head title="Setup Two-Factor Authentication" />

            <div className="w-full max-w-lg relative z-10">
                <div className="bg-[hsl(var(--card))] rounded-[calc(var(--radius)*2)] shadow-2xl border border-[hsl(var(--border))] p-8">
                    
                    <div className="text-center mb-6">
                        <div className="mx-auto w-16 h-16 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] flex items-center justify-center rounded-full mb-4">
                            <ShieldCheck size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
                            Secure Your Account
                        </h2>
                        <p className="text-[hsl(var(--muted-foreground))] text-sm">
                            Scan the QR code below with your authenticator app (e.g. Google Authenticator, Authy) and enter the code to enable Two-Factor Authentication.
                        </p>
                    </div>

                    <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl border border-[hsl(var(--border))] mb-6 mx-auto w-max shadow-inner">
                        <div 
                            dangerouslySetInnerHTML={{ __html: qrCodeSvg }} 
                            className="w-48 h-48"
                        />
                    </div>

                    <div className="text-center mb-6">
                        <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase font-bold tracking-wider mb-1">Manual Setup Key</p>
                        <code className="bg-[hsl(var(--muted))] px-3 py-1 rounded text-sm font-mono tracking-widest text-[hsl(var(--foreground))] select-all">
                            {secret}
                        </code>
                    </div>

                    <form onSubmit={submit} className="space-y-4 border-t border-[hsl(var(--border))] pt-6 mt-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[hsl(var(--foreground))] block text-center">
                                Enter 6-digit Code
                            </label>
                            <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                className="h-14 text-center text-2xl tracking-widest font-mono mx-auto max-w-[200px]"
                                required
                            />
                            {errors.code && (
                                <p className="text-xs text-[hsl(var(--destructive))] font-medium text-center mt-2">
                                    {errors.code}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            disabled={processing || data.code.length !== 6}
                            className="w-full shadow-lg mt-4"
                        >
                            {processing ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                "Enable Two-Factor Authentication"
                            )}
                        </Button>

                        <button 
                            type="button" 
                            onClick={() => router.post(route('logout'))}
                            className="w-full text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mt-4 transition-colors"
                        >
                            Log Out Instead
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MfaSetup;
