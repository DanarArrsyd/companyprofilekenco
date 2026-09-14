<?php

use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\PageController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('company/{path?}', [PageController::class, 'company'])
    ->where('path', '.*')
    ->name('public.company');
