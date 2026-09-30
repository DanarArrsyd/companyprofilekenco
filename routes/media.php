<?php

use App\Http\Controllers\Public\ImageVariantController;
use App\Services\ImageVariantService;
use Illuminate\Support\Facades\Route;

/*
| Responsive image variants, outside the web middleware group: no session,
| cookies or CSRF, so the one PHP-built response is as cacheable as the
| static file that replaces it. See ImageVariantService.
*/
Route::get('storage/'.ImageVariantService::DIRECTORY.'/w{width}/{path}', ImageVariantController::class)
    ->whereIn('width', array_map('strval', ImageVariantService::WIDTHS))
    ->where('path', '.+\.webp')
    ->name('media.variant');
