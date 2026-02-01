<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\Auth\HomeController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\POSController;

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
    Route::get('/reports', fn() => Inertia::render('admin/Reports'));
    Route::get('/settings', fn() => Inertia::render('admin/Settings'));
    Route::get('/attendance', fn() => Inertia::render('admin/Attendance'));
    Route::get('/payroll', fn() => Inertia::render('admin/Payroll'));

    // Events CRUD
    Route::get('/events', [App\Http\Controllers\EventController::class, 'index'])->name('admin.events');
    Route::post('/events', [App\Http\Controllers\EventController::class, 'store'])->name('admin.events.store');
    Route::put('/events/{event}', [App\Http\Controllers\EventController::class, 'update'])->name('admin.events.update');

    // Locations CRUD
    Route::get('/locations', [LocationController::class, 'index'])->name('admin.locations');
    Route::post('/locations', [LocationController::class, 'store'])->name('admin.locations.store');
    Route::put('/locations/{location}', [LocationController::class, 'update'])->name('admin.locations.update');
    Route::delete('/locations/{location}', [LocationController::class, 'archive'])->name('admin.locations.archive');
    Route::post('/locations/{location}/restore', [LocationController::class, 'restore'])->name('admin.locations.restore');

    // Employees/Roster CRUD
    Route::get('/roster', [EmployeeController::class, 'index'])->name('admin.roster');
    Route::post('/employees', [EmployeeController::class, 'store'])->name('admin.employees.store');
    Route::put('/employees/{employee}', [EmployeeController::class, 'update'])->name('admin.employees.update');
    Route::delete('/employees/{employee}', [EmployeeController::class, 'archive'])->name('admin.employees.archive');
    Route::post('/employees/{employee}/restore', [EmployeeController::class, 'restore'])->name('admin.employees.restore');
});

// Staff Routes
Route::prefix('staff')->middleware('auth')->group(function () {
    Route::get('/attendance', fn() => Inertia::render('staff/StaffAttendance'))->name('staff.attendance');
    Route::get('/pos', [POSController::class, 'index'])->name('staff.pos');
    Route::post('/pos/orders', [POSController::class, 'storeOrder'])->name('staff.pos.order');
    Route::get('/inventory', fn() => Inertia::render('staff/StaffInventory'))->name('staff.inventory');
});