<?php

use App\Models\Article;
use App\Models\Capability;
use App\Models\Certification;
use App\Models\Facility;
use App\Models\Industry;
use App\Models\JobVacancy;
use App\Models\Machine;
use App\Models\Media;
use App\Models\Milestone;
use App\Models\Page;
use App\Models\Product;
use App\Models\QualityContent;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Database\Eloquent\Model;

/*
 * "Open the edit form and press Save without touching anything" must leave
 * the record exactly as it was. Each payload is built from the Inertia props
 * the Edit page receives, the same way the matching Edit.tsx initialises its
 * useForm() state, so a mismatch between props, form and FormRequest shows
 * up here as lost or changed data.
 */

function roundTripAdmin(): User
{
    test()->seed(RolePermissionSeeder::class);

    return tap(User::factory()->create())->assignRole('Super Admin');
}

/** Edit.tsx pattern: the form keeps the serialized UTC timestamp (lib/datetime-input.ts). */
function formDate(?string $value): string
{
    return $value ?? '';
}

/** SeoFields initial state as built by every Edit.tsx that has an SEO panel. */
function formSeo(?array $seo): array
{
    return [
        'meta_title' => $seo['meta_title'] ?? '',
        'meta_description' => $seo['meta_description'] ?? '',
        'canonical_url' => $seo['canonical_url'] ?? '',
        'og_title' => $seo['og_title'] ?? '',
        'og_description' => $seo['og_description'] ?? '',
        'og_image_path' => $seo['og_image'] ?? '',
        'robots_index' => $seo['robots_index'] ?? true,
        'robots_follow' => $seo['robots_follow'] ?? true,
        'translations' => ['id' => $seo['translations']['id'] ?? []],
    ];
}

/**
 * Stored state that a no-op save must not change. Certificate dates are
 * date-only inputs, so their time of day is not part of the comparison.
 */
function snapshot(Model $model): array
{
    $model->refresh();
    $attributes = collect($model->getAttributes())->except(['updated_at', 'updated_by'])
        ->map(fn ($value, $key) => match (true) {
            in_array($key, ['issued_at', 'expires_at'], true) && $value !== null => substr($value, 0, 10),
            default => $value,
        })
        ->all();

    if (method_exists($model, 'seoMetadata')) {
        $attributes['seo'] = collect($model->seoMetadata?->getAttributes() ?? [])->except(['id', 'created_at', 'updated_at'])->all();
    }

    return $attributes;
}

function seedSeo(Model $model): void
{
    $model->seoMetadata()->create([
        'meta_title' => ['en' => 'Meta', 'id' => 'Meta ID'],
        'meta_description' => ['en' => 'Description', 'id' => 'Deskripsi'],
        'og_image' => 'library/og.webp',
    ]);
}

dataset('edit forms', [
    'capability' => [fn () => tap(Capability::factory()->published()->create(['featured_image' => 'library/cap.webp', 'icon' => 'cog']), 'seedSeo'), 'capabilities', 'capability',
        fn (array $r) => ['slug' => $r['slug'], 'name' => $r['name'], 'summary' => $r['summary'] ?? '', 'description' => $r['description'] ?? '', 'icon' => $r['icon'] ?? '', 'featured_image_path' => $r['featured_image'] ?? '', 'is_featured' => $r['is_featured'], 'sort_order' => $r['sort_order'], 'status' => $r['status'], 'published_at' => formDate($r['published_at']), 'seo' => formSeo($r['seo_metadata']), 'translations' => ['id' => $r['translations']['id'] ?? []]]],
    'article' => [fn () => tap(Article::factory()->published()->create(['featured_image' => 'library/news.webp']), 'seedSeo'), 'news', 'article',
        fn (array $r) => ['slug' => $r['slug'], 'title' => $r['title'], 'excerpt' => $r['excerpt'] ?? '', 'content' => $r['content'] ?? '', 'news_category_id' => $r['news_category_id'] ?? '', 'featured_image_path' => $r['featured_image'] ?? '', 'is_featured' => $r['is_featured'], 'status' => $r['status'], 'published_at' => formDate($r['published_at']), 'seo' => formSeo($r['seo_metadata']), 'translations' => ['id' => $r['translations']['id'] ?? []]]],
    'product' => [fn () => tap(Product::factory()->published()->create(['featured_image' => 'library/product.webp']), 'seedSeo'), 'products', 'product',
        fn (array $r) => ['slug' => $r['slug'], 'name' => $r['name'], 'short_description' => $r['short_description'] ?? '', 'description' => $r['description'] ?? '', 'material' => $r['material'] ?? '', 'manufacturing_process' => $r['manufacturing_process'] ?? '', 'application' => $r['application'] ?? '', 'product_category_id' => $r['product_category_id'] ?? '', 'featured_image_path' => $r['featured_image'] ?? '', 'is_featured' => $r['is_featured'], 'status' => $r['status'], 'published_at' => formDate($r['published_at']), 'seo' => formSeo($r['seo_metadata']), 'translations' => ['id' => $r['translations']['id'] ?? []]]],
    'vacancy' => [fn () => tap(JobVacancy::factory()->published()->create(['closes_at' => now()->addMonth()]), 'seedSeo'), 'careers', 'vacancy',
        fn (array $r) => ['slug' => $r['slug'], 'title' => $r['title'], 'department' => $r['department'] ?? '', 'location' => $r['location'] ?? '', 'employment_type' => $r['employment_type'] ?? '', 'description' => $r['description'] ?? '', 'requirements' => $r['requirements'] ?? '', 'status' => $r['status'], 'published_at' => formDate($r['published_at']), 'closes_at' => formDate($r['closes_at']), 'seo' => formSeo($r['seo_metadata']), 'translations' => ['id' => $r['translations']['id'] ?? []]]],
    'page' => [fn () => tap(Page::factory()->published()->create(), 'seedSeo'), 'pages', 'page',
        fn (array $r) => ['title' => $r['title'], 'status' => $r['status'], 'published_at' => formDate($r['published_at']), 'seo' => formSeo($r['seo_metadata']), 'translations' => ['id' => $r['translations']['id'] ?? []]]],
    'facility' => [fn () => Facility::factory()->published()->create(['image' => 'library/facility.webp']), 'facilities', 'facility',
        fn (array $r) => ['slug' => $r['slug'], 'name' => $r['name'], 'location' => $r['location'] ?? '', 'description' => $r['description'] ?? '', 'facility_category_id' => $r['facility_category_id'] ?? '', 'image_path' => $r['image'] ?? '', 'sort_order' => $r['sort_order'], 'status' => $r['status'], 'published_at' => formDate($r['published_at']), 'translations' => ['id' => $r['translations']['id'] ?? []]]],
    'industry' => [fn () => Industry::factory()->published()->create(['image' => 'library/industry.webp']), 'industries', 'industry',
        fn (array $r) => ['slug' => $r['slug'], 'name' => $r['name'], 'description' => $r['description'] ?? '', 'image_path' => $r['image'] ?? '', 'sort_order' => $r['sort_order'], 'status' => $r['status'], 'published_at' => formDate($r['published_at']), 'translations' => ['id' => $r['translations']['id'] ?? []]]],
    'quality content' => [fn () => QualityContent::factory()->published()->create(['image' => 'library/quality.webp']), 'quality-content', 'item',
        fn (array $r) => ['slug' => $r['slug'], 'title' => $r['title'], 'summary' => $r['summary'] ?? '', 'content' => $r['content'] ?? '', 'image_path' => $r['image'] ?? '', 'sort_order' => $r['sort_order'], 'status' => $r['status'], 'published_at' => formDate($r['published_at']), 'translations' => ['id' => $r['translations']['id'] ?? []]]],
    'certification' => [fn () => Certification::factory()->published()->create(['media_id' => Media::factory()->create(['path' => 'library/cert.webp'])->id]), 'certifications', 'certification',
        fn (array $r) => ['name' => $r['name'], 'issuer' => $r['issuer'] ?? '', 'certificate_number' => $r['certificate_number'] ?? '', 'issued_at' => $r['issued_at'] ? substr($r['issued_at'], 0, 10) : '', 'expires_at' => $r['expires_at'] ? substr($r['expires_at'], 0, 10) : '', 'image_path' => $r['media']['path'] ?? '', 'sort_order' => $r['sort_order'], 'status' => $r['status'], 'published_at' => formDate($r['published_at'])]],
    'machine' => [fn () => Machine::factory()->create(['image' => 'library/machine.webp']), 'machines', 'machine',
        fn (array $r) => ['name' => $r['name'], 'brand' => $r['brand'] ?? '', 'model' => $r['model'] ?? '', 'capacity' => $r['capacity'] ?? '', 'quantity' => $r['quantity'] ?? '', 'description' => $r['description'] ?? '', 'specification' => $r['specification'] ?? '', 'facility_id' => $r['facility_id'] ?? '', 'capability_ids' => array_column($r['capabilities'] ?? [], 'id'), 'image_path' => $r['image'] ?? '', 'sort_order' => $r['sort_order'], 'status' => $r['status']]],
    'milestone' => [fn () => Milestone::factory()->create(['image' => 'library/milestone.webp']), 'milestones', 'milestone',
        fn (array $r) => ['year' => $r['year'], 'title' => $r['title'], 'description' => $r['description'] ?? '', 'order' => $r['order'], 'image_path' => '', 'remove_image' => false, 'translations' => ['id' => $r['translations']['id'] ?? []]]],
]);

test('saving an edit form without changes keeps the stored record', function (Closure $make, string $route, string $prop, Closure $form) {
    $admin = roundTripAdmin();
    $model = $make();
    $before = snapshot($model);

    $record = $this->actingAs($admin)->get(route("admin.{$route}.edit", $model))
        ->assertOk()
        ->viewData('page')['props'][$prop];
    $record = json_decode(json_encode($record), true);

    $this->actingAs($admin)
        ->put(route("admin.{$route}.update", $model), $form($record))
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect(snapshot($model))->toEqual($before);
})->with('edit forms');
