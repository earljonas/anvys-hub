import React, { useRef, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Shield, Loader2 } from 'lucide-react';
import Button from '../../Components/common/Button';
import Input from '../../Components/common/Input';

const MfaVerify = () => {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const codeInput = useRef(null);

    useEffect(() => {
        if (codeInput.current) {
            codeInput.current.focus();
        }
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('mfa.verify.post'));
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[hsl(var(--background))] relative overflow-hidden">
            <Head title="Two-Factor Verification" />

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[hsl(var(--primary))]/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[hsl(var(--primary))]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-[hsl(var(--card))] rounded-[calc(var(--radius)*2)] shadow-2xl shadow-[hsl(var(--primary))]/10 border border-[hsl(var(--border))] p-8 text-center">
                    
                    <div className="mx-auto w-16 h-16 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] flex items-center justify-center rounded-full mb-6">
                        <Shield size={32} />
                    </div>

                    <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
                        Two-Factor Authentication
                    </h2>
                    <p className="text-[hsl(var(--muted-foreground))] text-sm mb-8">
                        Please enter the 6-digit code from your authenticator app to access the dashboard.
                    </p>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                className="h-14 text-center text-2xl tracking-widest font-mono"
                                required
                                ref={codeInput}
                            />
                            {errors.code && (
                                <p className="text-xs text-[hsl(var(--destructive))] font-medium mt-2">
                                    {errors.code}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            disabled={processing || data.code.length !== 6}
                            className="w-full shadow-lg"
                        >
                            {processing ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                "Verify Code"
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MfaVerify;
