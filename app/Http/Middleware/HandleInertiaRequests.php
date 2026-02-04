<?php

namespace App\Http\Middleware;

use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $employee = null;

        if (Auth::check()) {
            $emp = Employee::where('user_id', Auth::id())->with('location')->first();
            if ($emp) {
                $employee = [
                    'id' => $emp->id,
                    'name' => $emp->name,
                    'locationId' => $emp->location_id,
                    'locationName' => $emp->location?->name,
                ];
            }
        }

        return [
            ...parent::share($request),
            'employee' => $employee,
        ];
    }
}
