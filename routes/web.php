<?php

use App\Http\Controllers\Public\CapabilityController;
use App\Http\Controllers\Public\CareerController;
use App\Http\Controllers\Public\CertificationController;
use App\Http\Controllers\Public\ContactController;
use App\Http\Controllers\Public\FaviconController;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\NewsController;
use App\Http\Controllers\Public\PageController;
use App\Http\Controllers\Public\ProductController;
use App\Http\Controllers\Public\QualityController;
use App\Http\Controllers\Public\RobotsController;
use App\Http\Controllers\Public\SitemapController;
use App\Models\Article;
use App\Models\Capability;
use App\Models\JobVacancy;
use App\Models\Product;
use App\Support\Locale;
use Illuminate\Support\Facades\Route;

Route::get('sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
Route::get('robots.txt', [RobotsController::class, 'index'])->name('robots');
Route::get('favicon.ico', FaviconController::class)->name('favicon');

/*
 * Public pages, registered once per locale: Bahasa Indonesia (default) at the
 * root with the original route names, every other locale under its prefix
 * with names prefixed "{locale}." (e.g. /en/products → en.public.products).
 * SetLocale reads the locale from the same URL prefix.
 */
$registerPublicRoutes = function (string $locale): void {
    $path = fn (string $target) => Locale::path($target, $locale);

    Route::get('/', [HomeController::class, 'index'])->name('home');

    // /company is one long page merging About, Vision & Mission, Facilities,
    // and Industries into #about/#vision-mission/#facilities/#industries
    // sections — these three old standalone URLs redirect there permanently.
    // Registered before the company/{path?} wildcard so the literal match wins.
    Route::redirect('company/vision-mission', $path('/company#vision-mission'), 301);
    Route::redirect('facilities', $path('/company#facilities'), 301);
    Route::redirect('industries', $path('/company#industries'), 301);

    Route::get('company/{path?}', [PageController::class, 'company'])
        ->where('path', '.*')
        ->name('public.company');

    Route::get('products', [ProductController::class, 'index'])->name('public.products');
    Route::get('products/{slug}', [ProductController::class, 'show'])
        ->middleware('slug.redirect:'.Product::class.',products')
        ->name('public.products.show');

    Route::get('capabilities', [CapabilityController::class, 'index'])->name('public.capabilities');
    Route::get('capabilities/{slug}', [CapabilityController::class, 'show'])
        ->middleware('slug.redirect:'.Capability::class.',capabilities')
        ->name('public.capabilities.show');

    Route::get('quality', [QualityController::class, 'index'])->name('public.quality');

    Route::get('certifications', [CertificationController::class, 'index'])->name('public.certifications');

    Route::get('news', [NewsController::class, 'index'])->name('public.news');
    Route::get('news/{slug}', [NewsController::class, 'show'])
        ->middleware('slug.redirect:'.Article::class.',news')
        ->name('public.news.show');

    Route::get('careers', [CareerController::class, 'index'])->name('public.careers');
    Route::get('careers/{slug}', [CareerController::class, 'show'])
        ->middleware('slug.redirect:'.JobVacancy::class.',careers')
        ->name('public.careers.show');
    Route::post('careers/{slug}/apply', [CareerController::class, 'apply'])
        ->middleware('throttle:5,1')
        ->name('public.careers.apply');

    Route::get('contact', [ContactController::class, 'show'])->name('public.contact');
    Route::post('contact', [ContactController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('public.contact.store');
};

foreach (Locale::prefixedLocales() as $locale) {
    Route::prefix($locale)->name("{$locale}.")->group(fn () => $registerPublicRoutes($locale));
}

$registerPublicRoutes(Locale::DEFAULT);
