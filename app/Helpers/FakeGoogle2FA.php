<?php

namespace App\Helpers;

class FakeGoogle2FA
{
    public function generateSecretKey()
    {
        return 'JBSWY3DPEHPK3PXP'; // A hardcoded standard Base32 secret for testing
    }

    public function getQRCodeUrl($companyName, $companyEmail, $secret)
    {
        // We'll just generate an API URL to quickchart.io for the QR code
        $url = sprintf(
            'otpauth://totp/%s:%s?secret=%s&issuer=%s',
            rawurlencode($companyName),
            rawurlencode($companyEmail),
            rawurlencode($secret),
            rawurlencode($companyName)
        );
        return $url;
    }

    public function verifyKey($secret, $code)
    {
        // For testing, just accept '123456' as the valid TOTP
        return $code === '123456';
    }
}
