{{--
    Server-rendered copy of SeoHead.tsx so crawlers that never run JavaScript
    (WhatsApp, Facebook, LinkedIn, X link previews) still read the metadata.
    Every tag carries the `inertia` attribute: Inertia's head manager removes
    or replaces these on hydration, so the browser never ends up with duplicates.
--}}
@php
    $seoLocale = $page['props']['locale'] ?? app()->getLocale();
    $seoAlternates = $page['props']['alternates'] ?? [];
    $seoSiteName = $page['props']['siteSettings']['company_name'] ?? null;
    $seoRobots = (($seo['robots_index'] ?? false) ? 'index' : 'noindex').', '.(($seo['robots_follow'] ?? false) ? 'follow' : 'nofollow');
    $seoOgTitle = $seo['og_title'] ?? null;
    $seoOgDescription = $seo['og_description'] ?? null;
    $seoOgImage = $seo['og_image'] ?? null;
@endphp
@if ($seo['description'] ?? null)
    <meta inertia name="description" content="{{ $seo['description'] }}">
@endif
<meta inertia name="robots" content="{{ $seoRobots }}">
@if ($seo['canonical_url'] ?? null)
    <link inertia rel="canonical" href="{{ $seo['canonical_url'] }}">
@endif
@foreach ($seoAlternates as $hreflang => $href)
    <link inertia rel="alternate" hreflang="{{ $hreflang }}" href="{{ $href }}">
@endforeach
@if ($seoAlternates[\App\Support\Locale::DEFAULT] ?? null)
    <link inertia rel="alternate" hreflang="x-default" href="{{ $seoAlternates[\App\Support\Locale::DEFAULT] }}">
@endif
<meta inertia property="og:locale" content="{{ $seoLocale === 'id' ? 'id_ID' : 'en_US' }}">
@if ($seoOgTitle)
    <meta inertia property="og:title" content="{{ $seoOgTitle }}">
@endif
@if ($seoOgDescription)
    <meta inertia property="og:description" content="{{ $seoOgDescription }}">
@endif
@if ($seo['canonical_url'] ?? null)
    <meta inertia property="og:url" content="{{ $seo['canonical_url'] }}">
@endif
<meta inertia property="og:type" content="{{ $seo['og_type'] ?? 'website' }}">
@if ($seoOgImage)
    <meta inertia property="og:image" content="{{ $seoOgImage }}">
@endif
@if ($seoSiteName)
    <meta inertia property="og:site_name" content="{{ $seoSiteName }}">
@endif
<meta inertia name="twitter:card" content="{{ $seo['twitter_card'] ?? ($seoOgImage ? 'summary_large_image' : 'summary') }}">
@if ($seo['twitter_title'] ?? $seoOgTitle)
    <meta inertia name="twitter:title" content="{{ $seo['twitter_title'] ?? $seoOgTitle }}">
@endif
@if ($seo['twitter_description'] ?? $seoOgDescription)
    <meta inertia name="twitter:description" content="{{ $seo['twitter_description'] ?? $seoOgDescription }}">
@endif
@if ($seo['twitter_image'] ?? $seoOgImage)
    <meta inertia name="twitter:image" content="{{ $seo['twitter_image'] ?? $seoOgImage }}">
@endif
@if ($seo['twitter_site'] ?? null)
    <meta inertia name="twitter:site" content="{{ $seo['twitter_site'] }}">
@endif
