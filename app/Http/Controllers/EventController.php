<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::all()->map(function ($event) {
            return [
                'id' => $event->id,
                'customerName' => $event->customer_name,
                'address' => $event->address,
                'contactNumber' => $event->contact_number,
                'packageId' => $event->package_id,
                'eventDate' => $event->event_date->format('Y-m-d'),
                'eventTime' => $event->event_time,
                'extraGuests' => $event->extra_guests,
                'totalPrice' => (float) $event->total_price,
                'paymentStatus' => $event->payment_status,
            ];
        });

        return Inertia::render('admin/Events', [
            'events' => $events,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customerName' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'contactNumber' => 'nullable|string|max:50',
            'packageId' => 'required|string',
            'eventDate' => 'required|date',
            'eventTime' => 'required|string',
            'extraGuests' => 'integer|min:0',
            'totalPrice' => 'required|numeric|min:0',
            'paymentStatus' => 'required|string|in:Pending,Paid,Partial',
        ]);

        Event::create([
            'customer_name' => $validated['customerName'],
            'address' => $validated['address'] ?? null,
            'contact_number' => $validated['contactNumber'] ?? null,
            'package_id' => $validated['packageId'],
            'event_date' => $validated['eventDate'],
            'event_time' => $validated['eventTime'],
            'extra_guests' => $validated['extraGuests'] ?? 0,
            'total_price' => $validated['totalPrice'],
            'payment_status' => $validated['paymentStatus'],
        ]);

        return redirect()->back()->with('success', 'Event created successfully.');
    }

    public function update(Request $request, Event $event)
    {
        // 1. Prevent editing past events
        if ($event->event_date->isPast() && !$event->event_date->isToday()) {
            // Allowing today for last minute changes, but strictly past dates are locked.
            // User requested "shouldn't be able to edit past events".
            // Let's stricter: if date < today, abort.

            // Check if the event date stored in DB is strictly in the past (yesterday or earlier)
            if ($event->event_date->lt(Carbon::today())) {
                return redirect()->back()->withErrors(['message' => 'Cannot edit past events.']);
            }
        }

        $validated = $request->validate([
            'customerName' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'contactNumber' => 'nullable|string|max:50',
            'packageId' => 'required|string',
            'eventDate' => 'required|date',
            'eventTime' => 'required|string',
            'extraGuests' => 'integer|min:0',
            'totalPrice' => 'required|numeric|min:0',
            'paymentStatus' => 'required|string|in:Pending,Paid,Partial',
        ]);

        $event->update([
            'customer_name' => $validated['customerName'],
            'address' => $validated['address'] ?? null,
            'contact_number' => $validated['contactNumber'] ?? null,
            'package_id' => $validated['packageId'],
            'event_date' => $validated['eventDate'],
            'event_time' => $validated['eventTime'],
            'extra_guests' => $validated['extraGuests'] ?? 0,
            'total_price' => $validated['totalPrice'],
            'payment_status' => $validated['paymentStatus'],
        ]);

        return redirect()->back()->with('success', 'Event updated successfully.');
    }
}
