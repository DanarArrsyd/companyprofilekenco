<?php

use Illuminate\Support\Facades\Cache;
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

test('the smoke check renders on the app url, so cached pages keep real links', function () {
    config(['app.url' => 'https://kencomanufactur.co.id']);

    $this->artisan('app:smoke', ['--path' => ['/sitemap.xml']])->assertExitCode(0);

    expect(Cache::get('sitemap.xml'))
        ->toContain('<loc>https://kencomanufactur.co.id</loc>')
        ->not->toContain('localhost');
});
