<?php

use App\Enums\SectionType;
use App\Models\Capability;
use App\Models\CapabilityStep;
use App\Models\Page;
use App\Models\PageSection;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Spatie\Permission\Models\Permission;

function translationAdmin(array $permissions): User
{
    foreach ($permissions as $permission) {
        Permission::findOrCreate($permission, 'web');
    }

    $user = User::factory()->create();
    $user->givePermissionTo($permissions);

    return $user;
}

test('admin edit pages receive every translation of the model and its SEO record', function () {
    $product = Product::factory()->create(['name' => 'Bracket']);
    $product->setTranslations('short_description', ['en' => 'Precision bracket.', 'id' => 'Braket presisi.'])->save();
    $product->seoMetadata()->create(['meta_title' => ['en' => 'Bracket', 'id' => 'Braket']]);

    $this->actingAs(translationAdmin(['products.update']))
        ->get(route('admin.products.edit', $product))
        ->assertInertia(fn ($page) => $page
            ->where('product.short_description', 'Precision bracket.')
            ->where('product.translations.id.short_description', 'Braket presisi.')
            ->where('product.seo_metadata.translations.id.meta_title', 'Braket')
        );
});

test('public pages never expose the translations payload', function () {
    Product::factory()->published()->create(['slug' => 'bracket'])
        ->setTranslations('short_description', ['en' => 'Bracket.', 'id' => 'Braket.'])->save();

    $this->get('/products/bracket')->assertInertia(fn ($page) => $page->missing('product.translations'));
});

test('saving a form stores the Indonesian translation next to the English text', function () {
    $product = Product::factory()->create(['name' => 'Bracket']);

    $this->actingAs(translationAdmin(['products.update']))->put(route('admin.products.update', $product), [
        'name' => 'Bracket',
        'short_description' => 'Precision bracket.',
        'status' => 'draft',
        'translations' => ['id' => ['short_description' => 'Braket presisi.']],
        'seo' => ['meta_title' => 'Bracket', 'translations' => ['id' => ['meta_title' => 'Braket']]],
    ])->assertRedirect()->assertSessionHasNoErrors();

    $product->refresh();

    expect($product->getTranslations('short_description'))->toBe(['en' => 'Precision bracket.', 'id' => 'Braket presisi.'])
        ->and($product->seoMetadata->getTranslations('meta_title'))->toBe(['en' => 'Bracket', 'id' => 'Braket']);
});

test('clearing a translation falls back to English again', function () {
    $product = Product::factory()->create(['name' => 'Bracket']);
    $product->setTranslations('short_description', ['en' => 'Bracket.', 'id' => 'Braket.'])->save();

    $this->actingAs(translationAdmin(['products.update']))->put(route('admin.products.update', $product), [
        'name' => 'Bracket',
        'short_description' => 'Bracket.',
        'status' => 'draft',
        'translations' => ['id' => ['short_description' => '']],
        'seo' => [],
    ])->assertRedirect();

    expect($product->fresh()->getTranslations('short_description'))->toBe(['en' => 'Bracket.']);
});

test('translations are validated with the English field limits but stay optional', function () {
    $category = ProductCategory::factory()->create();

    $this->actingAs(translationAdmin(['products.update']))
        ->put(route('admin.products.categories.update', $category), [
            'name' => 'Stamped Parts',
            'status' => 'published',
            'translations' => ['id' => ['name' => str_repeat('x', 300)]],
        ])->assertSessionHasErrors('translations.id.name');
});

test('controllers that save validated() input wholesale keep translations', function () {
    $category = ProductCategory::factory()->create();

    $this->actingAs(translationAdmin(['products.update']))
        ->put(route('admin.products.categories.update', $category), [
            'name' => 'Stamped Parts',
            'status' => 'published',
            'translations' => ['id' => ['name' => 'Komponen Stamping']],
        ])->assertSessionHasNoErrors();

    expect($category->fresh()->getTranslations('name'))->toBe(['en' => 'Stamped Parts', 'id' => 'Komponen Stamping']);
});

test('capability steps save their Indonesian title and description', function () {
    $capability = Capability::factory()->create();
    $step = CapabilityStep::create(['capability_id' => $capability->id, 'title' => 'Die design', 'sort_order' => 1]);

    $this->actingAs(translationAdmin(['capabilities.update']))
        ->put(route('admin.capabilities.steps.update', [$capability, $step]), [
            'title' => 'Die design',
            'description' => 'CAD modelling.',
            'translations' => ['id' => ['title' => 'Desain die', 'description' => 'Pemodelan CAD.']],
        ])->assertSessionHasNoErrors();

    expect($step->fresh()->getTranslations('title'))->toBe(['en' => 'Die design', 'id' => 'Desain die']);
});

test('section editors receive raw per-locale content and save both languages', function () {
    $user = translationAdmin(['pages.view', 'pages.update']);
    $page = Page::factory()->create();
    $section = PageSection::factory()->create([
        'page_id' => $page->id,
        'section_type' => SectionType::Hero,
        'content' => ['heading' => ['en' => 'Built to Last', 'id' => 'Dibuat untuk Bertahan'], 'image' => 'library/hero.jpg'],
    ]);

    $this->actingAs($user)->get(route('admin.pages.edit', $page))
        ->assertInertia(fn ($inertia) => $inertia->where('page.sections.0.content.heading.id', 'Dibuat untuk Bertahan'));

    $this->actingAs($user)->put(route('admin.pages.sections.update', [$page, $section]), [
        'section_type' => 'hero',
        'title' => 'Hero',
        'translations' => ['id' => ['title' => 'Pembuka']],
        'content' => [
            'heading' => ['en' => 'Built to Last', 'id' => 'Dibangun untuk Bertahan'],
            'primary_cta_url' => '/contact',
            'image' => 'library/hero.jpg',
        ],
        'is_active' => true,
    ])->assertRedirect()->assertSessionHasNoErrors();

    $section->refresh();

    expect($section->content['heading'])->toBe(['en' => 'Built to Last', 'id' => 'Dibangun untuk Bertahan'])
        ->and($section->content['image'])->toBe('library/hero.jpg')
        ->and($section->getTranslations('title'))->toBe(['en' => 'Hero', 'id' => 'Pembuka']);
});

test('edit pages expose saved SEO under the seo_metadata key the forms read', function () {
    $product = Product::factory()->create();
    $product->seoMetadata()->create(['meta_title' => 'Saved title', 'meta_description' => 'Saved description']);

    $this->actingAs(translationAdmin(['products.update']))
        ->get(route('admin.products.edit', $product))
        ->assertInertia(fn ($page) => $page
            ->where('product.seo_metadata.meta_title', 'Saved title')
            ->where('product.seo_metadata.meta_description', 'Saved description')
        );

    // The admin forms prefill from `seo_metadata`; reading any other key left
    // the SEO fields blank and wiped saved metadata on the next save.
    $source = collect(glob(resource_path('js/pages/admin/*/Edit.tsx')))->map(fn ($file) => file_get_contents($file))->implode("\n");
    expect($source)->not->toContain('seoMetadata');
});
