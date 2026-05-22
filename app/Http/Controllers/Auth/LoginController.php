<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function show()
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // Rate limiting: 5 attempts per 3 minutes, keyed by IP + email
        $throttleKey = Str::lower($request->input('email')) . '|' . $request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return back()->withErrors([
                'email' => "Too many login attempts. Please try again in {$seconds} seconds.",
            ])->onlyInput('email');
        }

        if (Auth::attempt($credentials, $request->remember)) {
            RateLimiter::clear($throttleKey);
            $request->session()->regenerate();

            \Illuminate\Support\Facades\Log::info('Login successful: user_id=' . Auth::id() . ' | role=' . (Auth::user()->is_admin ? 'admin' : 'staff'));

            if (Auth::user()->is_admin) {
                $request->session()->put('mfa_verified', false);
                return redirect()->intended('/admin/dashboard');
            } else {
                return redirect()->intended('/staff/attendance');
            }
        }

        RateLimiter::hit($throttleKey, 180); // 180 seconds = 3 minutes

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    }
}
