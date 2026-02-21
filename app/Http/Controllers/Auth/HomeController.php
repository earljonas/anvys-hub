<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class HomeController extends Controller
{
    public function index()
    {
        if (Auth::check()) {
            \Illuminate\Support\Facades\Log::info('Home controller check. User: ' . Auth::user()->email . ' | Is Admin: ' . (Auth::user()->is_admin ? 'YES' : 'NO'));
            return Auth::user()->is_admin
                ? redirect()->intended('/admin/dashboard')
                : redirect()->intended('/staff/attendance');
        }

        return redirect('/login');
    }
}
