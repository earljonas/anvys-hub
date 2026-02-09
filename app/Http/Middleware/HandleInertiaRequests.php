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
        $user = null;
        $employee = null;

        if (Auth::check()) {
            $authUser = Auth::user();
            $emp = Employee::where('user_id', Auth::id())->with('location')->first();

            $location = null;
            if ($emp && $emp->location) {
                $location = [
                    'id' => $emp->location->id,
                    'name' => $emp->location->name,
                ];
            }

            $employee = $emp ? [
                'id' => $emp->id,
                'name' => $authUser->name ?? 'Unknown',
                'locationId' => $emp->location_id,
                'locationName' => $emp->location?->name,
                'location' => $location,
            ] : null;

            $user = [
                'id' => $authUser->id,
                'name' => $authUser->name,
                'email' => $authUser->email,
                'is_admin' => $authUser->is_admin,
                'employee' => $employee,
            ];
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'employee' => $employee,
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
                'status' => fn() => $request->session()->get('status'),
            ],
        ];
    }
}
