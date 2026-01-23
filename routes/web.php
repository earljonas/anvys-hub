<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Auth/Login');
});

// Admin Routes
Route::prefix('admin')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('admin/Dashboard');
    });
    Route::get('/inventory', function () {
        return Inertia::render('admin/Inventory');
    });
    Route::get('/employees', function () {
        return Inertia::render('admin/Employees');
    });
    Route::get('/events', function () {
        return Inertia::render('admin/Events');
    });
    Route::get('/locations', function () {
        return Inertia::render('admin/Locations');
    });
    Route::get('/reports', function () {
        return Inertia::render('admin/Reports');
    });
    Route::get('/settings', function () {
        return Inertia::render('admin/Settings');
    });
});

// Staff Routes
Route::prefix('staff')->group(function () {
    Route::get('/attendance', function () {
        return Inertia::render('staff/Attendance');
    });
});
