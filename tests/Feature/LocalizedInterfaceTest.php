<?php

test('static page SEO titles follow the URL locale', function () {
    $this->get('/products')->assertInertia(fn ($page) => $page->where('seo.title', fn ($title) => str_starts_with($title, 'Produk')));
    $this->get('/en/products')->assertInertia(fn ($page) => $page->where('seo.title', fn ($title) => str_starts_with($title, 'Products')));
});

test('breadcrumb labels built on the server are translated', function () {
    $this->get('/careers')->assertOk();

    expect(__('Careers', [], 'id'))->toBe('Karier');
    expect(__('Careers', [], 'en'))->toBe('Careers');
});

test('contact form validation messages are Indonesian on the default locale', function () {
    $this->from('/contact')->post('/contact', [])
        ->assertSessionHasErrors(['name' => 'Nama wajib diisi.']);
});

test('contact form validation messages stay English under /en', function () {
    $this->from('/en/contact')->post('/en/contact', [])
        ->assertSessionHasErrors(['name' => 'The name field is required.']);
});

test('the contact success flash follows the locale', function () {
    $payload = ['name' => 'Budi', 'email' => 'budi@example.test', 'message' => 'Halo, kami ingin penawaran.'];

    $this->from('/contact')->post('/contact', $payload)
        ->assertSessionHas('success', 'Pesan Anda telah terkirim. Kami akan segera menghubungi Anda.');
});

test('pagination labels are translated for Indonesian visitors', function () {
    expect(__('pagination.next', [], 'id'))->toContain('Berikutnya');
});
