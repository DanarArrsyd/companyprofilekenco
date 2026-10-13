<?php

test('public pages open behind the page loader', function () {
    $this->get('/')
        ->assertOk()
        // public-root scales rem from the first paint, so the loader logo
        // never jumps in size when React mounts the public layout.
        ->assertSee('<html lang="id" class="public-root page-loading">', false)
        ->assertSee('id="page-loader"', false)
        ->assertSee('images/loader/logo-white.webp', false);
});

test('admin and error pages have no page loader', function () {
    $this->get(route('login'))->assertOk()
        ->assertDontSee('id="page-loader"', false)
        ->assertDontSee('public-root', false);

    $this->get('/tidak-ada')
        ->assertNotFound()
        ->assertSee('<html lang="id">', false)
        ->assertDontSee('id="page-loader"', false);
});

test('the loader images are published', function () {
    expect(public_path('images/loader/logo-white.webp'))->toBeFile()
        ->and(public_path('images/loader/brush.webp'))->toBeFile();
});
