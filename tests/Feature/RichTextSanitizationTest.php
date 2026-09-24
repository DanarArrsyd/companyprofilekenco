<?php

use App\Models\Article;
use App\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Permission::findOrCreate('news.create', 'web');
});

function richTextAuthor(): User
{
    $user = User::factory()->create();
    $user->givePermissionTo('news.create');

    return $user;
}

test('script, event handlers and javascript links are stripped from article content', function () {
    $this->actingAs(richTextAuthor())->post(route('admin.news.store'), [
        'title' => 'Payload Article',
        'status' => 'draft',
        'content' => '<p>Hi<script>alert(1)</script></p><img src=x onerror="alert(2)"><a href="javascript:alert(3)" onclick="x()">link</a><iframe src="https://evil.test"></iframe>',
        'seo' => [],
    ])->assertRedirect();

    $content = Article::query()->where('title', 'Payload Article')->value('content');

    expect($content)
        ->not->toContain('<script')
        ->not->toContain('onerror')
        ->not->toContain('onclick')
        ->not->toContain('javascript:')
        ->not->toContain('<iframe')
        ->not->toContain('<img')
        ->toContain('<p>Hi</p>');
});

test('formatting produced by the editor survives sanitization', function () {
    $html = '<h2>Heading</h2><p><strong>Bold</strong> and <em>italic</em> with <a href="https://kenco.test/about">a link</a>.</p><ul><li>One</li></ul><blockquote><p>Quote</p></blockquote>';

    $this->actingAs(richTextAuthor())->post(route('admin.news.store'), [
        'title' => 'Formatted Article',
        'status' => 'draft',
        'content' => $html,
        'seo' => [],
    ])->assertRedirect();

    $content = Article::query()->where('title', 'Formatted Article')->value('content');

    expect($content)
        ->toContain('<h2>Heading</h2>')
        ->toContain('<strong>Bold</strong>')
        ->toContain('<em>italic</em>')
        ->toContain('href="https://kenco.test/about"')
        ->toContain('rel="noopener noreferrer nofollow"')
        ->toContain('<li>One</li>')
        ->toContain('<blockquote>');
});
