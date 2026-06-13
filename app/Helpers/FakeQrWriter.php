<?php

namespace App\Helpers;

class FakeQrWriter
{
    public function writeString($url)
    {
        // Just return a dummy SVG or an img tag pointing to a public QR code generator API
        return '<img src="https://quickchart.io/qr?text=' . urlencode($url) . '&size=200" alt="QR Code" />';
    }
}
