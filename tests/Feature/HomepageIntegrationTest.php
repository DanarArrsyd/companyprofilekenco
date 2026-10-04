<?php

use App\Enums\ContentStatus;
use App\Enums\PageType;
use App\Models\Article;
use App\Models\Capability;
use App\Models\Certification;
use App\Models\Customer;
use App\Models\Facility;
use App\Models\Machine;
use App\Models\Milestone;
use App\Models\Page;
use App\Models\Product;
use App\Models\User;
use App\Services\SettingsService;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

beforeEach(function () {
    Permission::findOrCreate('pages.view', 'web');
});

function publishedHomepage(TestCase $testCase): Page
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

test('the homepage capability section lists the same capabilities, in the same order, as /capabilities', function () {
    $page = publishedHomepage($this);
    Capability::factory()->published()->create(['name' => 'Welding', 'sort_order' => 2]);
    Capability::factory()->published()->create(['name' => 'Stamping', 'sort_order' => 1]);
    Capability::factory()->create(['name' => 'Draft Only', 'status' => ContentStatus::Draft]);

    // A stale hand-picked list no longer limits the section.
    $page->sections()->where('section_type', 'capabilities')->first()->update([
        'content' => ['capability_ids' => [999999]],
        'is_active' => true,
    ]);

    $homepage = collect($this->get('/')->assertOk()->viewData('page')['props']['sections'])
        ->firstWhere('section_type', 'capabilities')['content']['items'];
    $listing = $this->get('/capabilities')->assertOk()->viewData('page')['props']['capabilities'];

    expect(collect($homepage)->pluck('name')->all())->toBe(['Stamping', 'Welding'])
        ->and(collect($listing)->pluck('name')->all())->toBe(['Stamping', 'Welding']);
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

test('homepage only exposes published certifications and shown customers', function () {
    publishedHomepage($this);
    Certification::factory()->published()->create(['name' => 'ISO 9001']);
    Certification::factory()->create(['name' => 'Draft Cert', 'status' => ContentStatus::Draft]);
    Customer::create(['name' => 'Astra Daihatsu', 'is_featured' => true]);
    Customer::create(['name' => 'Hidden Customer', 'is_featured' => false]);

    $response = $this->get('/');

    $response->assertInertia(fn ($assert) => $assert
        ->component('public/Home')
        ->where('certifications', fn ($certs) => collect($certs)->pluck('name')->contains('ISO 9001')
            && ! collect($certs)->pluck('name')->contains('Draft Cert'))
        ->where('customers.stamping', fn ($customers) => collect($customers)->pluck('name')->contains('Astra Daihatsu')
            && ! collect($customers)->pluck('name')->contains('Hidden Customer'))
        ->missing('industries')
    );
});

test('homepage stays safe with no certifications or customers configured', function () {
    publishedHomepage($this);

    $response = $this->get('/');

    $response->assertOk();
    $response->assertInertia(fn ($assert) => $assert
        ->component('public/Home')
        ->where('certifications', [])
        ->where('customers', ['stamping' => [], 'engineering' => []])
    );
});

test('the homepage no longer shows the company milestones timeline', function () {
    publishedHomepage($this);
    Milestone::factory()->create(['year' => 2005]);

    $this->get('/')->assertOk()->assertInertia(fn ($assert) => $assert->missing('milestones'));
});
