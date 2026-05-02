<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Helpers\RealGoogle2FA;
use App\Helpers\FakeQrWriter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MfaController extends Controller
{
    public function showSetup()
    {
        $user = Auth::user();

        // If they already have MFA set up, redirect to verification
        if (!empty($user->two_factor_secret)) {
            return redirect()->route('mfa.verify');
        }

        $google2fa = new RealGoogle2FA();
        $secret = $google2fa->generateSecretKey();

        // Generate the QR code URL
        $g2faUrl = $google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        // Render QR Code using our helper
        $writer = new FakeQrWriter();
        $qrCodeSvg = $writer->writeString($g2faUrl);

        // Store the secret in session temporarily until they verify it
        session(['mfa_setup_secret' => $secret]);

        return Inertia::render('Auth/MfaSetup', [
            'qrCodeSvg' => $qrCodeSvg,
            'secret' => $secret
        ]);
    }

    public function confirmSetup(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $secret = session('mfa_setup_secret');

        if (!$secret) {
            return back()->withErrors(['code' => 'Session expired. Please refresh the page.']);
        }

        $google2fa = new RealGoogle2FA();
        $valid = $google2fa->verifyKey($secret, $request->code);

        if ($valid) {
            $user = Auth::user();
            $user->two_factor_secret = encrypt($secret); // Encrypting the secret as well for extra security
            $user->two_factor_confirmed_at = now();
            $user->save();

            // Clear setup session and mark verified
            $request->session()->forget('mfa_setup_secret');
            $request->session()->put('mfa_verified', true);

            return redirect()->intended('/admin/dashboard');
        }

        return back()->withErrors(['code' => 'Invalid authentication code. Please try again.']);
    }

    public function showVerify()
    {
        // If they already verified, go to dashboard
        if (session('mfa_verified')) {
            return redirect()->intended('/admin/dashboard');
        }

        return Inertia::render('Auth/MfaVerify');
    }

    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $user = Auth::user();

        // Rate limiting: 5 attempts per 3 minutes, keyed by IP + user ID
        $throttleKey = 'mfa_verify|' . $user->id . '|' . $request->ip();

        if (\Illuminate\Support\Facades\RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = \Illuminate\Support\Facades\RateLimiter::availableIn($throttleKey);
            return back()->withErrors(['code' => "Too many attempts. Please try again in {$seconds} seconds."]);
        }

        if (empty($user->two_factor_secret)) {
            return redirect()->route('mfa.setup');
        }

        $google2fa = new RealGoogle2FA();
        $secret = decrypt($user->two_factor_secret);

        $valid = $google2fa->verifyKey($secret, $request->code);

        if ($valid) {
            \Illuminate\Support\Facades\RateLimiter::clear($throttleKey);
            $request->session()->put('mfa_verified', true);
            return redirect()->intended('/admin/dashboard');
        }

        \Illuminate\Support\Facades\RateLimiter::hit($throttleKey, 180);

        return back()->withErrors(['code' => 'Invalid authentication code. Please try again.']);
    }
}
