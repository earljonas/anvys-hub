<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SetupAccountController extends Controller
{
    public function show(Request $request, User $user)
    {
        if (! hash_equals((string) $request->query('hash'), sha1($user->password))) {
            abort(403, 'This setup link has already been used or is invalid.');
        }

        return Inertia::render('Auth/SetupAccount', [
            'userId' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            // Pass the exact signature to use for the POST request
            'submitUrl' => $request->fullUrl(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        if (! hash_equals((string) $request->query('hash'), sha1($user->password))) {
            abort(403, 'This setup link has already been used or is invalid.');
        }

        $validated = $request->validate([
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        // Automatically log them in
        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->to('/')->with('success', 'Account setup complete! Welcome to Anvys Hub.');
    }
}
