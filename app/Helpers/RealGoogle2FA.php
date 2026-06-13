<?php

namespace App\Helpers;

class RealGoogle2FA
{
    /**
     * Characters allowed in Base32 encoding
     */
    private $base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    /**
     * Generate a secure random Base32 secret key.
     */
    public function generateSecretKey($length = 16)
    {
        $secret = '';
        for ($i = 0; $i < $length; $i++) {
            $secret .= $this->base32Chars[random_int(0, 31)];
        }
        return $secret;
    }

    /**
     * Generate the otpauth:// URL for the QR code.
     */
    public function getQRCodeUrl($companyName, $companyEmail, $secret)
    {
        return sprintf(
            'otpauth://totp/%s:%s?secret=%s&issuer=%s',
            rawurlencode($companyName),
            rawurlencode($companyEmail),
            rawurlencode($secret),
            rawurlencode($companyName)
        );
    }

    /**
     * Verify a TOTP code against the given secret.
     */
    public function verifyKey($secret, $code, $window = 1)
    {
        // Strict 6-digit input validation
        if (empty($secret) || empty($code) || strlen((string)$code) !== 6 || !is_numeric($code)) {
            return false;
        }

        $timestamp = floor(time() / 30);
        $codeStr = (string)$code;
        
        for ($i = -$window; $i <= $window; $i++) {
            $validCode = $this->calculateCode($secret, $timestamp + $i);
            
            // Constant-time string comparison to prevent timing attacks
            if (hash_equals($validCode, $codeStr)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Calculate the TOTP code for a given timestamp.
     */
    private function calculateCode($secret, $time)
    {
        $decodedSecret = $this->base32Decode($secret);
        
        // Pack time into 8 bytes, big-endian
        $timeBytes = pack('N*', 0) . pack('N*', $time);
        
        // Generate HMAC-SHA1
        $hash = hash_hmac('sha1', $timeBytes, $decodedSecret, true);
        
        // Dynamic truncation (RFC 4226)
        $offset = ord($hash[19]) & 0xf;
        $code = (
            ((ord($hash[$offset]) & 0x7f) << 24) |
            ((ord($hash[$offset + 1]) & 0xff) << 16) |
            ((ord($hash[$offset + 2]) & 0xff) << 8) |
            (ord($hash[$offset + 3]) & 0xff)
        ) % 1000000;
        
        return str_pad((string)$code, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Decode a Base32 string to binary.
     */
    private function base32Decode($secret)
    {
        $secret = strtoupper($secret);
        $decoded = '';
        $buffer = 0;
        $bufferBits = 0;
        
        for ($i = 0; $i < strlen($secret); $i++) {
            $char = $secret[$i];
            if ($char === '=') continue; // Skip padding
            
            $val = strpos($this->base32Chars, $char);
            if ($val === false) continue; // Invalid character
            
            $buffer = ($buffer << 5) | $val;
            $bufferBits += 5;
            
            if ($bufferBits >= 8) {
                $bufferBits -= 8;
                $decoded .= chr(($buffer >> $bufferBits) & 0xFF);
            }
        }
        
        return $decoded;
    }
}
