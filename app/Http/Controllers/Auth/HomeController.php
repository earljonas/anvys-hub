<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class HomeController extends Controller
{
    public function index()
    {
        if (Auth::check()) {
            $user = Auth::user();

            if ($user->is_admin) {
                return session('mfa_verified')
                    ? redirect('/admin/dashboard')
                    : redirect('/mfa/verify');
            }

            return redirect('/staff/attendance');
        }

        return redirect('/login');
    }
}
