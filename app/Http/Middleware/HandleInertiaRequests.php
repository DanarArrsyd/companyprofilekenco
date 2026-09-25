<?php

namespace App\Http\Middleware;

use App\Models\Article;
use App\Services\SettingsService;
use App\Services\Translation\Translator;
use App\Support\Locale;
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

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'roles' => $user?->getRoleNames() ?? [],
                'permissions' => $user?->getAllPermissions()->pluck('name') ?? [],
            ],
            'siteSettings' => $this->siteSettings(),
            'locale' => app()->getLocale(),
            'locales' => Locale::SUPPORTED,
            'defaultLocale' => Locale::DEFAULT,
            'alternates' => $request->is('admin', 'admin/*') ? [] : fn () => Locale::alternates($request),
            'menuNews' => $request->is('admin', 'admin/*') ? [] : fn () => $this->menuNews(),
            'autoTranslate' => $request->is('admin', 'admin/*') && app(Translator::class)->isConfigured(),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
        ];
    }

    /**
     * Props for public error pages rendered from the exception handler. An
     * unmatched URL never runs the web middleware, so these must stand on
     * their own — nothing here touches the session or the authenticated user.
     *
     * @return array<string, mixed>
     */
    public function errorPageProps(Request $request): array
    {
        return [
            'auth' => ['user' => null, 'roles' => [], 'permissions' => []],
            'siteSettings' => $this->siteSettings(),
            'locale' => app()->getLocale(),
            'locales' => Locale::SUPPORTED,
            'defaultLocale' => Locale::DEFAULT,
            'alternates' => Locale::alternates($request),
            'menuNews' => [],
            'flash' => [],
        ];
    }

    /** @return array<string, mixed> */
    private function siteSettings(): array
    {
        $settings = $this->settings->all();

        return [
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
        ];
    }

    /**
     * Latest published articles for the public navigation panel.
     *
     * @return array<int, array{title: string, slug: string, featured_image: ?string, published_at: ?string}>
     */
    private function menuNews(): array
    {
        return Article::query()
            ->published()
            ->latest('published_at')
            ->limit(2)
            ->get(['title', 'slug', 'featured_image', 'published_at'])
            ->map(fn (Article $article) => [
                'title' => $article->title,
                'slug' => $article->slug,
                'featured_image' => $article->featured_image,
                'published_at' => $article->published_at?->toDateString(),
            ])
            ->all();
    }
}
