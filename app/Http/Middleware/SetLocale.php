<?php

namespace App\Http\Middleware;

use App\Support\Locale;
use App\Support\LocalizedContent;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\Response;

/**
 * Resolve the locale from the URL before anything renders, so shared Inertia
 * props, <html lang>, validation messages and dates all agree.
 */
class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = Locale::fromRequest($request);

        app()->setLocale($locale);
        Carbon::setLocale($locale);
        LocalizedContent::$serializeAllLocales = $request->is('admin', 'admin/*');

        return $next($request);
    }
}
