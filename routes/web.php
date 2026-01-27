<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\Auth\HomeController;
use App\Http\Controllers\Auth\LoginController;

// Root redirect
Route::get('/', [HomeController::class, 'index']);

// Guest Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'show'])->name('login');
    Route::post('/login', [LoginController::class, 'login'])->name('login.post');
});

// Logout
Route::post('/logout', [LoginController::class, 'logout'])
    ->middleware('auth')
    ->name('logout');

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