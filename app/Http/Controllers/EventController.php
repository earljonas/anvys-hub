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
        $events = Event::with('package')->get()->map(function ($event) {
            return [
                'id' => $event->id,
                'customerName' => $event->customer_name,
                'address' => $event->address,
                'contactNumber' => $event->contact_number,
                'packageId' => $event->event_package_id,
                'packageName' => $event->package?->name,
                'eventDate' => $event->event_date->format('Y-m-d'),
                'eventTime' => $event->event_time,
                'extraGuests' => $event->extra_guests,
                'totalPrice' => (float) $event->total_price,
                'paymentStatus' => $event->payment_status,
            ];
        });

        \Illuminate\Support\Facades\Log::info('EventController: Loading packages...');
        $allPackages = \App\Models\EventPackage::all();
        \Illuminate\Support\Facades\Log::info('EventController: Found ' . $allPackages->count() . ' packages.');

        $packages = $allPackages->map(function ($pkg) {
            return [
                'id' => $pkg->id,
                'name' => $pkg->name,
                'slug' => $pkg->slug,
                'price' => (float) $pkg->price,
                'cupsCount' => $pkg->cups_count,
                'extraGuestPrice' => (float) $pkg->extra_guest_price,
                'description' => $pkg->description,
                'features' => $pkg->features,
            ];
        })->values()->toArray();

        return Inertia::render('admin/Events', [
            'events' => $events,
            'packages' => $packages,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customerName' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'contactNumber' => 'nullable|string|max:50',
            'packageId' => 'required|exists:event_packages,id',
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
            'event_package_id' => $validated['packageId'],
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

            // Check if the event date stored in DB is strictly in the past
            if ($event->event_date->lt(Carbon::today())) {
                return redirect()->back()->withErrors(['message' => 'Cannot edit past events.']);
            }
        }

        $validated = $request->validate([
            'customerName' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'contactNumber' => 'nullable|string|max:50',
            'packageId' => 'required|exists:event_packages,id',
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
            'event_package_id' => $validated['packageId'],
            'event_date' => $validated['eventDate'],
            'event_time' => $validated['eventTime'],
            'extra_guests' => $validated['extraGuests'] ?? 0,
            'total_price' => $validated['totalPrice'],
            'payment_status' => $validated['paymentStatus'],
        ]);

        return redirect()->back()->with('success', 'Event updated successfully.');
    }
}
