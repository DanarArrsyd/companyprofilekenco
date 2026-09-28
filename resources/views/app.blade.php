@php
    // Public pages open behind the page loader (resources/js/lib/page-loader.ts).
    $pageLoader = str_starts_with($page['component'], 'public/') && ! request()->is('admin*');
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}"@if ($pageLoader) class="page-loading"@endif>
    <head>
        <meta charset="utf-8">
        @if ($contentSecurityPolicyMeta ?? null)
            <meta http-equiv="Content-Security-Policy" content="{{ $contentSecurityPolicyMeta }}">
        @endif
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        @if ($siteIcon = app(\App\Services\SettingsService::class)->siteIcon())
            <link rel="icon" type="{{ $siteIcon['type'] }}" href="{{ $siteIcon['url'] }}">
            <link rel="apple-touch-icon" href="{{ $siteIcon['url'] }}">
        @endif

        @if (request()->is('admin*'))
            <meta name="robots" content="noindex, nofollow">
        @endif

        @if ($pageLoader)
            <link rel="preload" as="image" href="{{ asset('images/loader/logo-white.webp') }}" fetchpriority="high">
            <link rel="preload" as="image" href="{{ asset('images/loader/brush.webp') }}">
        @endif

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=caveat:400,500,600,700|inter:400,500,600,700|montserrat:400,700&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes(auth()->check() ? null : 'public', \Illuminate\Support\Facades\Vite::cspNonce())
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @if ($pageLoader)
            <div id="page-loader" class="page-loader is-running" aria-hidden="true">
                <div class="page-loader__inner">
                    <img class="page-loader__brush" src="{{ asset('images/loader/brush.webp') }}" alt="" width="1400" height="1092" draggable="false">
                    <div class="page-loader__center">
                        <img class="page-loader__logo" src="{{ asset('images/loader/logo-white.webp') }}" alt="" width="984" height="116" draggable="false">
                        <div class="page-loader__track">
                            <div class="page-loader__lines"><span></span><span></span><span></span><span></span></div>
                            <div class="page-loader__fill"></div>
                            <div class="page-loader__mover">
                                <div class="speeder">
                                    <div class="speeder__body">
                                        <span><span></span><span></span><span></span><span></span></span>
                                        <div class="speeder__base"><span></span><div class="speeder__face"></div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        @endif
        @inertia
    </body>
</html>
