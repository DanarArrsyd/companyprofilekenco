<?php

use Illuminate\Support\Facades\Route;

test('the smoke check passes when every key page answers', function () {
    $this->artisan('app:smoke')
        ->expectsOutputToContain('200 /contact')
        ->expectsOutputToContain('200 /sitemap.xml')
        ->assertExitCode(0);
});

test('the smoke check fails when a page errors', function () {
    Route::get('/smoke-broken', fn () => abort(500));

    $this->artisan('app:smoke', ['--path' => ['/smoke-broken']])
        ->expectsOutputToContain('500 /smoke-broken')
        ->assertExitCode(1);
});
