<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

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
