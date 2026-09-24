<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Spatie\Translatable\Facades\Translatable;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // CMS text falls back to English when a translation is missing, and a
        // NULL column stays null (not '') so `??` fallbacks keep working.
        Translatable::fallback(fallbackLocale: 'en');
        Translatable::allowNullForTranslation();

        // Public visitors never need the admin CMS bundle (RichTextEditor,
        // DataTable, every CRUD page, ...). Prefetching it unconditionally
        // made every homepage visit silently download the entire admin
        // panel, so scope it to admin traffic where the instant-navigation
        // benefit is actually intended.
        if (! $this->app->runningInConsole() && request()->is('admin*')) {
            Vite::prefetch(concurrency: 3);
        }
    }
}
