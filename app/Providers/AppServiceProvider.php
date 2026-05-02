<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinutes(3, 5)->by($request->ip() . $request->input('email'));
        });

        RateLimiter::for('mfa', function (Request $request) {
            return Limit::perMinutes(3, 5)->by($request->ip() . $request->user()?->id);
        });

        RateLimiter::for('clock_in', function (Request $request) {
            // Keyed by IP to protect the kiosk/network from brute force attempts
            return Limit::perMinutes(3, 5)->by($request->ip());
        });
    }
}
