<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// Root redirect
Route::get('/', function () {
    if (Auth::check()) {
        return Auth::user()->is_admin
            ? redirect('/admin/dashboard')
            : redirect('/staff/attendance');
    }
    return redirect('/login');
});

// Guest Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', function () {
        return Inertia::render('Auth/Login');
    })->name('login');

    Route::post('/login', function (Request $request) {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->remember)) {
            $request->session()->regenerate();

            return Auth::user()->is_admin
                ? redirect()->intended('/admin/dashboard')
                : redirect()->intended('/staff/attendance');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    });
});

// Logout
Route::post('/logout', function (Request $request) {
    Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return redirect('/login');
})->middleware('auth')->name('logout');

// Admin Routes
Route::prefix('admin')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/dashboard', fn() => Inertia::render('admin/Dashboard'))->name('admin.dashboard');
    Route::get('/inventory', fn() => Inertia::render('admin/Inventory'));
    Route::get('/employees', fn() => Inertia::render('admin/Employees'));
    Route::get('/events', fn() => Inertia::render('admin/Events'));
    Route::get('/locations', fn() => Inertia::render('admin/Locations'));
    Route::get('/reports', fn() => Inertia::render('admin/Reports'));
    Route::get('/settings', fn() => Inertia::render('admin/Settings'));
    Route::get('/roster', fn() => Inertia::render('admin/Roster'));
    Route::get('/attendance', fn() => Inertia::render('admin/Attendance'));
    Route::get('/payroll', fn() => Inertia::render('admin/Payroll'));
});

// Staff Routes
Route::prefix('staff')->middleware('auth')->group(function () {
    Route::get('/attendance', fn() => Inertia::render('staff/Attendance'))->name('staff.attendance');
});