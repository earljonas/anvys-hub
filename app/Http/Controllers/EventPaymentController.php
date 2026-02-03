<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventPayment;
use Illuminate\Http\Request;

class EventPaymentController extends Controller
{
    public function store(Request $request, Event $event)
    {
        // Prevent adding payments to cancelled events
        if ($event->isCancelled()) {
            return redirect()->back()->withErrors(['message' => 'Cannot add payments to cancelled events.']);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string|max:500',
        ]);

        $event->payments()->create([
            'amount' => $validated['amount'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Payment recorded successfully.');
    }
}
