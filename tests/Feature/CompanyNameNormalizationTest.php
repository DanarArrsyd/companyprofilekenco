<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

it('normalizes company names in localized copy and SEO without changing URLs', function () {
    DB::table('site_settings')->where('key', 'company_name')->update(['value' => 'Kenco Manufacturing']);
    DB::table('site_settings')->insert([
        'key' => 'company_description',
        'value' => 'PT. Kenco Manufactur Indonesia builds precision parts.',
        'type' => 'text',
    ]);

    $pageId = DB::table('pages')->insertGetId([
        'title' => json_encode(['en' => 'About Kenco Manufacturing', 'id' => 'Tentang PT. Kenco Manufactur Indonesia']),
        'slug' => 'about-kenco-manufacturing',
    ]);

    $sectionId = DB::table('page_sections')->insertGetId([
        'page_id' => $pageId,
        'section_type' => 'text',
        'content' => json_encode([
            'body' => [
                'en' => 'Kenco Manufactur makes parts for industry.',
                'id' => 'PT. Kenco Manufactur Indonesia membuat komponen industri.',
            ],
            'link' => '/news/about-kenco-manufacturing',
        ]),
    ]);

    DB::table('seo_metadata')->insert([
        'seoable_type' => 'App\\Models\\Page',
        'seoable_id' => $pageId,
        'meta_title' => 'Kenco Manufacturing | Company',
        'og_description' => 'Learn about PT. Kenco Manufactur Indonesia.',
        'canonical_url' => 'https://example.com/about-kenco-manufacturing',
    ]);

    $migration = require database_path('migrations/2026_10_26_000001_normalize_company_name_in_public_content.php');
    $migration->up();
    $migration->up();

    $this->assertDatabaseHas('site_settings', ['key' => 'company_name', 'value' => 'PT Kenco Manufactur Indonesia']);
    $this->assertDatabaseHas('site_settings', ['key' => 'legal_name', 'value' => 'PT Kenco Manufactur Indonesia']);
    $this->assertDatabaseHas('site_settings', ['key' => 'company_description', 'value' => 'PT Kenco Manufactur Indonesia builds precision parts.']);
    $this->assertDatabaseHas('pages', ['id' => $pageId, 'slug' => 'about-kenco-manufacturing']);

    $title = json_decode(DB::table('pages')->where('id', $pageId)->value('title'), true);
    expect($title)->toBe([
        'en' => 'About PT Kenco Manufactur Indonesia',
        'id' => 'Tentang PT Kenco Manufactur Indonesia',
    ]);

    $content = json_decode(DB::table('page_sections')->where('id', $sectionId)->value('content'), true);
    expect($content['body'])->toBe([
        'en' => 'PT Kenco Manufactur Indonesia makes parts for industry.',
        'id' => 'PT Kenco Manufactur Indonesia membuat komponen industri.',
    ])->and($content['link'])->toBe('/news/about-kenco-manufacturing');

    $this->assertDatabaseHas('seo_metadata', [
        'seoable_id' => $pageId,
        'meta_title' => 'PT Kenco Manufactur Indonesia | Company',
        'og_description' => 'Learn about PT Kenco Manufactur Indonesia.',
        'canonical_url' => 'https://example.com/about-kenco-manufacturing',
    ]);
});
