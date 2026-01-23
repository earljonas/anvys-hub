import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import logo from '../../../assets/logo.png';
import { User, ArrowRight } from 'lucide-react';
import Input from '../../Components/common/Input';
import Button from '../../Components/common/Button';

const Login = () => {
  const [username, setUsername] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Mock login - default to admin, but readily changeable
    if (username.toLowerCase().includes('staff')) {
      router.visit('/staff/attendance');
    } else {
      router.visit('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4">
      <div className="w-full max-w-md bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-xl p-8 animate-float">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-[hsl(var(--primary))/20] rounded-full flex items-center justify-center mb-4 p-4">
            <img src={logo} alt="Anvys Hub" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-foreground))]">
            Anvy's Hub
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-2 text-center">
            Welcome back! Please login to continue.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[hsl(var(--foreground))]">
              Username
            </label>
            <Input
              icon={User}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              className="py-3"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={ArrowRight}
            className="w-full justify-center"
          >
            Login to System
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[hsl(var(--border))]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[hsl(var(--card))] px-2 text-[hsl(var(--muted-foreground))]">
                Mock Login Only
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
