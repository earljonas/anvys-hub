<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LocationController extends Controller
{
    public function index()
    {
        $locations = Location::withTrashed()->withCount([
            'employees' => function ($query) {
                $query->where('status', 'Active')
                      ->whereHas('user', function ($q) {
                          $q->whereNull('deleted_at')
                            ->where('is_admin', false);
                      });
            }
        ])->get()->map(function ($location) {
            return [
                'id' => $location->id,
                'name' => $location->name,
                'address' => $location->address,
                'status' => $location->status,
                'staffCount' => $location->employees_count,
            ];
        });

        return Inertia::render('admin/Locations', [
            'locations' => $locations,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
        ]);

        Location::create([
            'name' => $validated['name'],
            'address' => $validated['address'],
            'status' => 'Active',
        ]);

        return redirect()->back()->with('success', 'Location created successfully.');
    }

    /**
     * Update the specified location.
     */
    public function update(Request $request, Location $location)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
        ]);

        $location->update($validated);

        return redirect()->back()->with('success', 'Location updated successfully.');
    }

    /**
     * Archive (soft delete) the specified location.
     */
    public function archive(Location $location)
    {
        $location->update(['status' => 'Archived']);
        $location->delete();

        return redirect()->back()->with('success', 'Location archived successfully.');
    }

    /**
     * Restore an archived location.
     */
    public function restore($id)
    {
        $location = Location::withTrashed()->findOrFail($id);
        $location->restore();
        $location->update(['status' => 'Active']);

        return redirect()->back()->with('success', 'Location restored successfully.');
    }
}
