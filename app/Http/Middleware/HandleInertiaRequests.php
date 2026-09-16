<?php

namespace App\Http\Middleware;

use App\Services\SettingsService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    public function __construct(
        private readonly SettingsService $settings,
    ) {}

    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $settings = $this->settings->all();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'roles' => $user?->getRoleNames() ?? [],
                'permissions' => $user?->getAllPermissions()->pluck('name') ?? [],
            ],
            'siteSettings' => [
                'company_name' => $settings['company_name'] ?: config('app.name'),
                'tagline' => $settings['tagline'] ?: null,
                'logo' => $settings['logo'] ?: null,
                'address' => $settings['address'] ?: null,
                'phone' => $settings['phone'] ?: null,
                'email' => $settings['email'] ?: null,
                'operating_hours' => $settings['operating_hours'] ?: null,
                'map_embed_url' => $settings['map_embed_url'] ?: null,
                'social' => [
                    'linkedin' => $settings['social_linkedin'] ?: null,
                    'youtube' => $settings['social_youtube'] ?: null,
                    'instagram' => $settings['social_instagram'] ?: null,
                ],
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
        ];
    }
}
