<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check() || !auth()->user()->is_admin) {
            \Illuminate\Support\Facades\Log::info('Admin middleware rejected access. Auth check: ' . (auth()->check() ? 'YES' : 'NO') . ' | Is Admin: ' . (auth()->check() ? (auth()->user()->is_admin ? 'YES' : 'NO') : 'N/A'));
            return redirect('/staff/attendance');
        }

        return $next($request);
    }
}