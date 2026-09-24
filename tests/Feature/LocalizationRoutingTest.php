<?php

use App\Models\Product;
use App\Models\User;
use Spatie\Permission\Models\Permission;

test('the root serves Bahasa Indonesia and /en serves English', function () {
    $this->get('/')->assertOk()
        ->assertSee('<html lang="id">', false)
        ->assertInertia(fn ($page) => $page->where('locale', 'id'));

    $this->get('/en')->assertOk()
        ->assertSee('<html lang="en">', false)
        ->assertInertia(fn ($page) => $page->where('locale', 'en'));
});

test('every public page exists under both locales', function (string $path) {
    $this->get($path)->assertOk();
    $this->get('/en'.$path)->assertOk();
})->with(['/products', '/capabilities', '/quality', '/certifications', '/news', '/careers', '/contact', '/company']);

test('detail pages resolve the same slug in both locales', function () {
    Product::factory()->published()->create(['slug' => 'flange-coupling']);

    $this->get('/products/flange-coupling')->assertOk();
    $this->get('/en/products/flange-coupling')->assertOk();
});

test('pages share hreflang alternates for the current path and query', function () {
    $this->get('/en/products?category=stamping')->assertInertia(fn ($page) => $page
        ->where('alternates.id', url('/products?category=stamping'))
        ->where('alternates.en', url('/en/products?category=stamping'))
    );

    $this->get('/')->assertInertia(fn ($page) => $page
        ->where('alternates.id', url('/'))
        ->where('alternates.en', url('/en'))
    );
});

test('legacy section redirects stay inside the requested locale', function () {
    $this->get('/facilities')->assertRedirect('/company#facilities');
    $this->get('/en/facilities')->assertRedirect('/en/company#facilities');
});

test('unknown English URLs render the error page in English', function () {
    $this->get('/en/does-not-exist')->assertNotFound()->assertSee('<html lang="en">', false);
    $this->get('/tidak-ada')->assertNotFound()->assertSee('<html lang="id">', false);
});

test('the admin CMS always runs in English without public alternates', function () {
    Permission::findOrCreate('settings.manage', 'web');
    $user = User::factory()->create();
    $user->givePermissionTo('settings.manage');

    $this->actingAs($user)->get(route('admin.settings'))
        ->assertInertia(fn ($page) => $page->where('locale', 'en')->where('alternates', []));
});

test('the sitemap lists both locales with hreflang alternates', function () {
    $xml = $this->get('/sitemap.xml')->assertOk()->getContent();

    expect($xml)
        ->toContain('<loc>'.url('/products').'</loc>')
        ->toContain('<loc>'.url('/en/products').'</loc>')
        ->toContain('hreflang="x-default" href="'.url('/products').'"')
        ->toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
});

test('guests receive English route names in the public Ziggy group', function () {
    expect($this->get('/')->getContent())->toContain('en.public.products');
});
