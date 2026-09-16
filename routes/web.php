<?php

use App\Http\Controllers\Public\CapabilityController;
use App\Http\Controllers\Public\CareerController;
use App\Http\Controllers\Public\CertificationController;
use App\Http\Controllers\Public\ContactController;
use App\Http\Controllers\Public\FacilityController;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\IndustryController;
use App\Http\Controllers\Public\NewsController;
use App\Http\Controllers\Public\PageController;
use App\Http\Controllers\Public\ProductController;
use App\Http\Controllers\Public\QualityController;
use App\Http\Controllers\Public\RobotsController;
use App\Http\Controllers\Public\SitemapController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
Route::get('robots.txt', [RobotsController::class, 'index'])->name('robots');

Route::get('company/{path?}', [PageController::class, 'company'])
    ->where('path', '.*')
    ->name('public.company');

Route::get('products', [ProductController::class, 'index'])->name('public.products');
Route::get('products/{slug}', [ProductController::class, 'show'])->name('public.products.show');

Route::get('capabilities', [CapabilityController::class, 'index'])->name('public.capabilities');
Route::get('capabilities/{slug}', [CapabilityController::class, 'show'])->name('public.capabilities.show');

Route::get('facilities', [FacilityController::class, 'index'])->name('public.facilities');

Route::get('quality', [QualityController::class, 'index'])->name('public.quality');

Route::get('certifications', [CertificationController::class, 'index'])->name('public.certifications');

Route::get('industries', [IndustryController::class, 'index'])->name('public.industries');

Route::get('news', [NewsController::class, 'index'])->name('public.news');
Route::get('news/{slug}', [NewsController::class, 'show'])->name('public.news.show');

Route::get('careers', [CareerController::class, 'index'])->name('public.careers');
Route::get('careers/{slug}', [CareerController::class, 'show'])->name('public.careers.show');
Route::post('careers/{slug}/apply', [CareerController::class, 'apply'])
    ->middleware('throttle:5,1')
    ->name('public.careers.apply');

Route::get('contact', [ContactController::class, 'show'])->name('public.contact');
Route::post('contact', [ContactController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('public.contact.store');
