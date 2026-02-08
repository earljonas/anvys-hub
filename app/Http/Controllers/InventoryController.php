<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\Location;
use App\Models\StockLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InventoryController extends Controller
{
    /**
     * Display a listing of inventory items.
     */
    public function index()
    {
        $items = InventoryItem::with('location')->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'location' => $item->location?->name ?? 'All Locations',
                'locationId' => $item->location_id,
                'stock' => $item->stock,
                'minStock' => $item->min_stock,
                'unit' => $item->unit,
                'costPerUnit' => (float) $item->cost_per_unit,
                'status' => $item->status,
            ];
        });

        $locations = Location::where('status', 'Active')->get(['id', 'name']);

        $logs = StockLog::with(['inventoryItem', 'location', 'user.employee'])
            ->orderBy('logged_at', 'desc')
            ->limit(100)
            ->get()
            ->map(function ($log) {
                // Use employee name if available, otherwise fall back to user name
                $adjustedBy = 'System';
                if ($log->user) {
                    $adjustedBy = $log->user->employee?->name ?? $log->user->name;
                }
                return [
                    'id' => $log->id,
                    'date' => $log->logged_at->format('Y-m-d'),
                    'time' => $log->logged_at->format('h:i A'),
                    'item' => $log->inventoryItem?->name ?? 'Deleted Item',
                    'location' => $log->location?->name ?? 'Unknown',
                    'type' => $log->type,
                    'quantity' => $log->quantity,
                    'notes' => $log->notes,
                    'adjustedBy' => $adjustedBy,
                ];
            });

        return Inertia::render('admin/Inventory', [
            'items' => $items,
            'locations' => $locations,
            'logs' => $logs,
        ]);
    }

    /**
     * Store a newly created inventory item.
     * If 'All Locations' is selected, creates one item per active location.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'locationId' => 'nullable',
            'stock' => 'required|integer|min:0',
            'minStock' => 'required|integer|min:0',
            'unit' => 'required|string|max:50',
            'costPerUnit' => 'required|numeric|min:0',
        ]);

        // Determine which locations to create items for
        $locationIds = [];
        if (empty($validated['locationId']) || $validated['locationId'] === 'all') {
            // Create for all active locations
            $locationIds = Location::where('status', 'Active')->pluck('id')->toArray();
        } else {
            $locationIds = [(int) $validated['locationId']];
        }

        foreach ($locationIds as $locationId) {
            $item = InventoryItem::create([
                'name' => $validated['name'],
                'location_id' => $locationId,
                'stock' => $validated['stock'],
                'min_stock' => $validated['minStock'],
                'unit' => $validated['unit'],
                'cost_per_unit' => $validated['costPerUnit'],
            ]);

            // Create initial stock log if stock > 0
            if ($validated['stock'] > 0) {
                StockLog::create([
                    'inventory_item_id' => $item->id,
                    'location_id' => $locationId,
                    'user_id' => Auth::id(),
                    'type' => 'IN',
                    'quantity' => $validated['stock'],
                    'logged_at' => now(),
                ]);
            }
        }

        $message = count($locationIds) > 1
            ? 'Item added to ' . count($locationIds) . ' locations successfully.'
            : 'Item added successfully.';

        return redirect()->back()->with('success', $message);
    }

    /**
     * Update the specified inventory item (without changing stock).
     * Stock changes should be done via adjustStock method.
     */
    public function update(Request $request, InventoryItem $inventoryItem)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'locationId' => 'required|exists:locations,id',
            'minStock' => 'required|integer|min:0',
            'unit' => 'required|string|max:50',
            'costPerUnit' => 'required|numeric|min:0',
        ]);

        $inventoryItem->update([
            'name' => $validated['name'],
            'location_id' => $validated['locationId'],
            'min_stock' => $validated['minStock'],
            'unit' => $validated['unit'],
            'cost_per_unit' => $validated['costPerUnit'],
        ]);

        return redirect()->back()->with('success', 'Item updated successfully.');
    }

    /**
     * Adjust stock for an inventory item.
     */
    public function adjustStock(Request $request, InventoryItem $inventoryItem)
    {
        $validated = $request->validate([
            'type' => 'required|in:in,out',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        $type = $validated['type'];
        $quantity = $validated['quantity'];

        if ($type === 'in') {
            $inventoryItem->stock += $quantity;
        } else {
            $inventoryItem->stock = max(0, $inventoryItem->stock - $quantity);
        }

        $inventoryItem->save();

        // Create stock log
        StockLog::create([
            'inventory_item_id' => $inventoryItem->id,
            'location_id' => $inventoryItem->location_id,
            'user_id' => Auth::id(),
            'type' => strtoupper($type),
            'quantity' => $quantity,
            'notes' => $validated['notes'] ?? null,
            'logged_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Stock adjusted successfully.');
    }

    /**
     * Archive (soft delete) the specified inventory item.
     */
    public function archive(InventoryItem $inventoryItem)
    {
        $inventoryItem->delete();

        return redirect()->back()->with('success', 'Item archived successfully.');
    }

    /**
     * Restore an archived inventory item.
     */
    public function restore($id)
    {
        $item = InventoryItem::withTrashed()->findOrFail($id);
        $item->restore();

        return redirect()->back()->with('success', 'Item restored successfully.');
    }

    /**
     * Display inventory for staff (filtered by their location).
     */
    public function staffIndex()
    {
        $user = Auth::user();

        // Get staff's assigned location (if they have one via employee record)
        $employee = $user->employee;
        $locationId = $employee?->location_id;

        $itemsQuery = InventoryItem::with('location');

        // If staff has a location, show items for that location
        if ($locationId) {
            $itemsQuery->where('location_id', $locationId);
        }

        $items = $itemsQuery->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'location' => $item->location?->name,
                'locationId' => $item->location_id,
                'stock' => $item->stock,
                'minStock' => $item->min_stock,
                'unit' => $item->unit,
                'costPerUnit' => (float) $item->cost_per_unit,
                'status' => $item->status,
            ];
        });

        $locations = Location::where('status', 'Active')->get(['id', 'name']);

        return Inertia::render('staff/StaffInventory', [
            'items' => $items,
            'locations' => $locations,
            'staffLocationId' => $locationId,
        ]);
    }
}
