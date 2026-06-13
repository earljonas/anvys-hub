<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Show the staff settings page.
     */
    public function index()
    {
        return Inertia::render('staff/Settings');
    }

    /**
     * Update the user's password.
     */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Password updated successfully.');
    }

    /**
     * Update the user's clock-in PIN.
     */
    public function updatePin(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'clock_pin' => ['required', 'string', 'digits:4'],
        ]);

        $request->user()->update([
            'clock_pin' => $validated['clock_pin'],
        ]);

        return back()->with('success', 'Clock-in PIN updated successfully.');
    }
}
