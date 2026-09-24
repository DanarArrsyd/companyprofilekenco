<?php

use App\Models\User;

test('public responses carry hardening headers and a nonce-based CSP', function () {
    $response = $this->get('/');

    $response->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('X-Frame-Options', 'SAMEORIGIN')
        ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
        ->assertHeaderMissing('X-Powered-By');

    $csp = $response->headers->get('Content-Security-Policy');

    expect($csp)
        ->toMatch("/script-src 'self' 'nonce-[A-Za-z0-9]+'/")
        ->toContain("object-src 'none'")
        ->toContain("frame-ancestors 'self'")
        ->not->toContain("'unsafe-eval'");
});

test('inline scripts emitted by the page carry the CSP nonce', function () {
    $response = $this->get('/');

    preg_match("/'nonce-([A-Za-z0-9]+)'/", $response->headers->get('Content-Security-Policy'), $match);

    expect($match[1] ?? null)->not->toBeNull();
    $response->assertSee('nonce="'.$match[1].'"', false);
});

test('HSTS is only sent over HTTPS', function () {
    $this->get('/')->assertHeaderMissing('Strict-Transport-Security');
    $this->get('https://localhost/')->assertHeader('Strict-Transport-Security', 'max-age=31536000');
});

test('guests do not receive the admin route map', function () {
    $html = $this->get('/')->getContent();

    expect($html)->toContain('public.contact.store')
        ->not->toContain('admin.users.store')
        ->not->toContain('admin.settings.update');
});

test('signed-in admins still receive the full route map', function () {
    $html = $this->actingAs(User::factory()->create())->get('/')->getContent();

    expect($html)->toContain('admin.settings.update');
});

test('password reset requests are throttled', function () {
    foreach (range(1, 6) as $attempt) {
        $this->post(route('password.email'), ['email' => "nobody{$attempt}@kenco.test"]);
    }

    $this->post(route('password.email'), ['email' => 'nobody@kenco.test'])->assertStatus(429);
});

test('the CSP is repeated in a meta tag so an edge-rewritten header cannot drop it', function () {
    $response = $this->get('/');
    $header = $response->headers->get('Content-Security-Policy');

    preg_match('/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/', $response->getContent(), $meta);

    expect($meta[1] ?? null)->not->toBeNull();
    expect(html_entity_decode($meta[1]))
        ->toBe(str_replace("; frame-ancestors 'self'", '', $header))
        ->not->toContain('frame-ancestors');
});
