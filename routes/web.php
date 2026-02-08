<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\HomeController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\Admin\EmployeeController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\Admin\AttendanceController as AdminAttendanceController;
use App\Http\Controllers\Staff\AttendanceController as StaffAttendanceController;
use App\Http\Controllers\Admin\PayrollController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\POSController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\EventPaymentController;

Route::get('/', [HomeController::class, 'index']);

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'show'])->name('login');
    Route::post('/login', [LoginController::class, 'login'])->name('login.post');
});

Route::post('/logout', [LoginController::class, 'logout'])
    ->middleware('auth')
    ->name('logout');

Route::prefix('admin')->middleware(['auth', 'admin'])->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');

    Route::get('/settings', fn() => Inertia::render('admin/Settings'));


    Route::get('/events', [EventController::class, 'index'])->name('admin.events');
    Route::post('/events', [EventController::class, 'store'])->name('admin.events.store');
    Route::put('/events/{event}', [EventController::class, 'update'])->name('admin.events.update');
    Route::post('/events/{event}/cancel', [EventController::class, 'cancel'])->name('admin.events.cancel');
    Route::post('/events/{event}/payments', [EventPaymentController::class, 'store'])->name('admin.events.payments.store');

    Route::get('/locations', [LocationController::class, 'index'])->name('admin.locations');
    Route::post('/locations', [LocationController::class, 'store'])->name('admin.locations.store');
    Route::put('/locations/{location}', [LocationController::class, 'update'])->name('admin.locations.update');
    Route::delete('/locations/{location}', [LocationController::class, 'archive'])->name('admin.locations.archive');
    Route::post('/locations/{location}/restore', [LocationController::class, 'restore'])->name('admin.locations.restore');

    Route::get('/employees', [EmployeeController::class, 'index'])->name('admin.employees');
    Route::post('/employees', [EmployeeController::class, 'store'])->name('admin.employees.store');
    Route::put('/employees/{employee}', [EmployeeController::class, 'update'])->name('admin.employees.update');
    Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy'])->name('admin.employees.archive');
    Route::post('/employees/{id}/restore', [EmployeeController::class, 'restore'])->name('admin.employees.restore');

    Route::get('/schedule', [ScheduleController::class, 'index'])->name('admin.schedule');
    Route::post('/schedule', [ScheduleController::class, 'store'])->name('admin.schedule.store');
    Route::post('/schedule/publish', [ScheduleController::class, 'publish'])->name('admin.schedule.publish');
    Route::put('/schedule/{id}', [ScheduleController::class, 'update'])->name('admin.schedule.update');
    Route::delete('/schedule/{id}', [ScheduleController::class, 'destroy'])->name('admin.schedule.destroy');

    Route::get('/attendance', [AdminAttendanceController::class, 'index'])->name('admin.attendance');
    Route::post('/attendance/{id}/approve', [AdminAttendanceController::class, 'approve'])->name('admin.attendance.approve');
    Route::post('/attendance/{id}/reject', [AdminAttendanceController::class, 'reject'])->name('admin.attendance.reject');
    Route::put('/attendance/{id}', [AdminAttendanceController::class, 'update'])->name('admin.attendance.update');

    Route::get('/payroll', [PayrollController::class, 'index'])->name('admin.payroll');
    Route::post('/payroll/calculate', [PayrollController::class, 'calculate'])->name('admin.payroll.calculate');
    Route::post('/payroll/generate', [PayrollController::class, 'generate'])->name('admin.payroll.generate');
    Route::get('/payroll/{id}', [PayrollController::class, 'show'])->name('admin.payroll.show');
    Route::post('/payroll/{id}/pay', [PayrollController::class, 'markAsPaid'])->name('admin.payroll.pay');

    Route::get('/inventory', [InventoryController::class, 'index'])->name('admin.inventory');
    Route::post('/inventory', [InventoryController::class, 'store'])->name('admin.inventory.store');
    Route::put('/inventory/{inventoryItem}', [InventoryController::class, 'update'])->name('admin.inventory.update');
    Route::post('/inventory/{inventoryItem}/adjust', [InventoryController::class, 'adjustStock'])->name('admin.inventory.adjust');
    Route::delete('/inventory/{inventoryItem}', [InventoryController::class, 'archive'])->name('admin.inventory.archive');
    Route::post('/inventory/{inventoryItem}/restore', [InventoryController::class, 'restore'])->name('admin.inventory.restore');

    Route::get('/reports/sales', [ReportsController::class, 'index'])->name('admin.reports.sales');
    Route::get('/reports/inventory', [ReportsController::class, 'inventory'])->name('admin.reports.inventory');
    Route::get('/reports/events', [ReportsController::class, 'events'])->name('admin.reports.events');
    Route::get('/reports/payroll', [ReportsController::class, 'payroll'])->name('admin.reports.payroll');
});

Route::prefix('staff')->middleware('auth')->group(function () {
    Route::get('/attendance', [StaffAttendanceController::class, 'index'])->name('staff.attendance');
    Route::post('/attendance/clock-in', [StaffAttendanceController::class, 'clockIn'])->name('staff.attendance.clockIn');
    Route::post('/attendance/clock-out', [StaffAttendanceController::class, 'clockOut'])->name('staff.attendance.clockOut');

    Route::get('/schedule', [ScheduleController::class, 'staffIndex'])->name('staff.schedule');

    Route::get('/pos', [POSController::class, 'index'])->name('staff.pos');
    Route::post('/pos/orders', [POSController::class, 'storeOrder'])->name('staff.pos.order');

    Route::get('/inventory', [InventoryController::class, 'staffIndex'])->name('staff.inventory');
    Route::post('/inventory/{inventoryItem}/adjust', [InventoryController::class, 'adjustStock'])->name('staff.inventory.adjust');
});