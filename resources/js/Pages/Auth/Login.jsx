import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import Button from '../../Components/common/Button';
import Input from '../../Components/common/Input';

const Login = () => {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const submit = (e) => {
    e.preventDefault();
    post('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[hsl(var(--background))] relative overflow-hidden">
      <Head title="Login" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[hsl(var(--primary))]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[hsl(var(--primary))]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[hsl(var(--primary))]/5 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo & Branding - Outside Card */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-[hsl(var(--primary))] rounded-2xl blur-xl opacity-20 animate-pulse" />
            <img
              src="/logo.png"
              alt="Anvy's Logo"
              className="w-20 h-20 object-contain relative z-10 drop-shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-black text-[hsl(var(--foreground))]">
            Anvy's <span className="text-[hsl(var(--primary))]">Hub</span>
          </h1>
        </div>

        <div className="bg-[hsl(var(--card))] rounded-[calc(var(--radius)*2)] shadow-2xl shadow-[hsl(var(--primary))]/10 border border-[hsl(var(--border))] p-8">
          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
              Welcome Back!
            </h2>
          </div>

          {/* Login Form */}
          <form onSubmit={submit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[hsl(var(--foreground))] block">
                Email Address
              </label>
              <Input
                type="email"
                icon={Mail}
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                placeholder="name@anvys.com"
                className="h-12"
                required
              />
              {errors.email && (
                <p className="text-xs text-[hsl(var(--destructive))] font-medium flex items-center gap-1">
                  <span className="w-1 h-1 bg-[hsl(var(--destructive))] rounded-full" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[hsl(var(--foreground))] block">
                Password
              </label>
              <Input
                type="password"
                icon={Lock}
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                placeholder="••••••••"
                className="h-12"
                required
              />
              {errors.password && (
                <p className="text-xs text-[hsl(var(--destructive))] font-medium flex items-center gap-1">
                  <span className="w-1 h-1 bg-[hsl(var(--destructive))] rounded-full" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={data.remember}
                    onChange={(e) => setData('remember', e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-[hsl(var(--border))] rounded-md bg-[hsl(var(--card))] peer-checked:bg-[hsl(var(--primary))] peer-checked:border-[hsl(var(--primary))] transition-all" />
                  <svg
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-[hsl(var(--primary-foreground))] opacity-0 peer-checked:opacity-100 transition-opacity"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] transition-colors select-none">
                  Remember me
                </span>
              </label>

              <a href="#" className="text-sm font-semibold text-[hsl(var(--primary))] hover:opacity-80 transition-opacity">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              disabled={processing}
              className="w-full shadow-lg cursor-pointer shadow-[hsl(var(--primary))]/20 hover:shadow-xl hover:shadow-[hsl(var(--primary))]/30 hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0"
            >
              {processing ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Sign In
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[hsl(var(--primary))]/10 rounded-full blur-2xl -z-10" />
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-[hsl(var(--primary))]/10 rounded-full blur-2xl -z-10" />

        {/* Footer */}
        <p className="text-center text-[hsl(var(--muted-foreground))] text-xs mt-8">
          © 2026 Anvy's Ice Scramble & Milkshakes
        </p>
      </div>
    </div>
  );
};

export default Login;