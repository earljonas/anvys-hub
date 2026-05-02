<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureMfaVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        // Only enforce MFA on admin users
        if ($user && $user->is_admin) {
            
            // Allow them to visit the setup or verification routes
            if ($request->is('mfa/*')) {
                return $next($request);
            }

            // If MFA is not yet verified in this session
            if (!$request->session()->get('mfa_verified', false)) {
                
                // If they haven't set up MFA yet, force them to set it up
                if (empty($user->two_factor_secret)) {
                    return redirect()->route('mfa.setup');
                }

                // Otherwise, force them to verify
                return redirect()->route('mfa.verify');
            }
        }

        return $next($request);
    }
}
