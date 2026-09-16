<?php

use App\Enums\ContentStatus;
use App\Enums\PageType;
use App\Models\Article;
use App\Models\Capability;
use App\Models\Certification;
use App\Models\Facility;
use App\Models\Industry;
use App\Models\Machine;
use App\Models\Page;
use App\Models\Product;
use App\Models\User;
use App\Services\SettingsService;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Permission::findOrCreate('pages.view', 'web');
});

function publishedHomepage(\Tests\TestCase $testCase): Page
{
    $user = User::factory()->create();
    $user->givePermissionTo('pages.view');
    $testCase->actingAs($user)->get(route('admin.homepage'));

    $page = Page::where('page_type', PageType::Homepage)->firstOrFail();
    $page->update(['status' => ContentStatus::Published, 'published_at' => now()->subDay()]);

    return $page;
}

test('selected featured products render on the public homepage', function () {
    $page = publishedHomepage($this);
    $product = Product::factory()->published()->create(['name' => 'Featured Widget']);

    $page->sections()->where('section_type', 'products')->first()->update([
        'content' => ['heading' => 'Our Products', 'product_ids' => [$product->id]],
        'is_active' => true,
    ]);

    $response = $this->get('/');

    $response->assertOk();
    $response->assertInertia(fn ($assert) => $assert
        ->component('public/Home')
        ->where('sections', fn ($sections) => collect($sections)
            ->firstWhere('section_type', 'products')['content']['items'][0]['name'] === 'Featured Widget')
    );
});

test('selected featured capabilities render on the public homepage', function () {
    $page = publishedHomepage($this);
    $capability = Capability::factory()->published()->create(['name' => 'Precision Welding']);

    $page->sections()->where('section_type', 'capabilities')->first()->update([
        'content' => ['capability_ids' => [$capability->id]],
        'is_active' => true,
    ]);

    $response = $this->get('/');

    $response->assertOk();
    $response->assertInertia(fn ($assert) => $assert
        ->component('public/Home')
        ->where('sections', fn ($sections) => collect($sections)
            ->firstWhere('section_type', 'capabilities')['content']['items'][0]['name'] === 'Precision Welding')
    );
});

test('homepage renders without error when no products or capabilities exist yet', function () {
    publishedHomepage($this);

    $response = $this->get('/');

    $response->assertOk();
});

test('latest published news renders safely on the homepage', function () {
    publishedHomepage($this);
    Article::factory()->published()->create(['title' => 'Visible News']);
    Article::factory()->create(['title' => 'Hidden Draft News']);

    $response = $this->get('/');

    $response->assertOk();
    $response->assertInertia(fn ($assert) => $assert
        ->component('public/Home')
        ->where('latestArticles', fn ($articles) => collect($articles)->pluck('title')->contains('Visible News')
            && ! collect($articles)->pluck('title')->contains('Hidden Draft News'))
    );
});

test('facilities featured section resolves real facility data', function () {
    $page = publishedHomepage($this);
    $facility = Facility::factory()->published()->create(['name' => 'Main Plant']);

    $page->sections()->where('section_type', 'facilities')->first()->update([
        'content' => ['facility_ids' => [$facility->id]],
        'is_active' => true,
    ]);

    $response = $this->get('/');

    $response->assertOk();
    $response->assertInertia(fn ($assert) => $assert
        ->component('public/Home')
        ->where('sections', fn ($sections) => collect($sections)
            ->firstWhere('section_type', 'facilities')['content']['items'][0]['name'] === 'Main Plant')
    );
});

test('facility machine specs are included when the relationship exists', function () {
    $page = publishedHomepage($this);
    $facility = Facility::factory()->published()->create(['name' => 'Main Plant']);
    Machine::factory()->create(['facility_id' => $facility->id, 'name' => 'CNC Mill', 'brand' => 'Haas', 'is_active' => true]);

    $page->sections()->where('section_type', 'facilities')->first()->update([
        'content' => ['facility_ids' => [$facility->id]],
        'is_active' => true,
    ]);

    $response = $this->get('/');

    $response->assertInertia(fn ($assert) => $assert
        ->component('public/Home')
        ->where('sections', fn ($sections) => collect($sections)
            ->firstWhere('section_type', 'facilities')['content']['items'][0]['machines'][0]['name'] === 'CNC Mill')
    );
});

test('hero section image content is passed through to the homepage', function () {
    $page = publishedHomepage($this);

    $page->sections()->where('section_type', 'hero')->first()->update([
        'content' => ['heading' => 'Precision Manufacturing', 'image' => 'library/hero.jpg'],
        'is_active' => true,
    ]);

    $response = $this->get('/');

    $response->assertInertia(fn ($assert) => $assert
        ->component('public/Home')
        ->where('sections', fn ($sections) => collect($sections)
            ->firstWhere('section_type', 'hero')['content']['image'] === 'library/hero.jpg')
    );
});

test('homepage contact CTA uses live Settings data, not invented values', function () {
    publishedHomepage($this);
    app(SettingsService::class)->setMany(['phone' => '+62-21-5551234', 'email' => 'sales@kenco.test']);

    $response = $this->get('/');

    $response->assertInertia(fn ($assert) => $assert
        ->component('public/Home')
        ->where('siteSettings.phone', '+62-21-5551234')
        ->where('siteSettings.email', 'sales@kenco.test')
    );
});

test('homepage only exposes published certifications and industries', function () {
    publishedHomepage($this);
    Certification::factory()->published()->create(['name' => 'ISO 9001']);
    Certification::factory()->create(['name' => 'Draft Cert', 'status' => ContentStatus::Draft]);
    Industry::factory()->published()->create(['name' => 'Automotive']);
    Industry::factory()->create(['name' => 'Draft Industry', 'status' => ContentStatus::Draft]);

    $response = $this->get('/');

    $response->assertInertia(fn ($assert) => $assert
        ->component('public/Home')
        ->where('certifications', fn ($certs) => collect($certs)->pluck('name')->contains('ISO 9001')
            && ! collect($certs)->pluck('name')->contains('Draft Cert'))
        ->where('industries', fn ($industries) => collect($industries)->pluck('name')->contains('Automotive')
            && ! collect($industries)->pluck('name')->contains('Draft Industry'))
    );
});

test('homepage stays safe with no certifications, industries, or milestones configured', function () {
    publishedHomepage($this);

    $response = $this->get('/');

    $response->assertOk();
    $response->assertInertia(fn ($assert) => $assert
        ->component('public/Home')
        ->where('certifications', [])
        ->where('industries', [])
        ->where('milestones', [])
    );
});
