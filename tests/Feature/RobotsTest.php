<?php

test('robots.txt disallows everything outside production', function () {
    expect(app()->environment())->not->toBe('production');

    $response = $this->get('/robots.txt');

    $response->assertOk();
    $response->assertHeader('Content-Type', 'text/plain; charset=UTF-8');
    $body = $response->getContent();
    $this->assertStringContainsString('Disallow: /', $body);
    $this->assertStringNotContainsString('Sitemap:', $body);
});

test('robots.txt allows crawling and advertises the sitemap in production', function () {
    app()->detectEnvironment(fn () => 'production');

    $response = $this->get('/robots.txt');

    $body = $response->getContent();
    $this->assertStringContainsString('Allow: /', $body);
    $this->assertStringContainsString('Disallow: /admin', $body);
    $this->assertStringContainsString('Sitemap: '.url('/sitemap.xml'), $body);

    app()->detectEnvironment(fn () => 'testing');
});
