<?php

use App\Enums\PageType;
use App\Enums\SectionType;
use App\Models\Page;
use App\Models\PageSection;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use App\Support\LocalizedContent;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;

test('public pages serve the Indonesian translation at the root and English under /en', function () {
    $category = ProductCategory::factory()->create();
    $category->setTranslations('name', ['en' => 'Stamped Parts', 'id' => 'Komponen Stamping'])->save();
    Product::factory()->published()->create(['product_category_id' => $category->id, 'slug' => 'bracket'])
        ->setTranslations('short_description', ['en' => 'Precision bracket.', 'id' => 'Braket presisi.'])->save();

    $this->get('/products/bracket')->assertInertia(fn ($page) => $page
        ->where('product.short_description', 'Braket presisi.')
    );
    $this->get('/en/products/bracket')->assertInertia(fn ($page) => $page
        ->where('product.short_description', 'Precision bracket.')
    );
});

test('missing Indonesian text falls back to English', function () {
    Product::factory()->published()->create(['slug' => 'flange'])
        ->setTranslations('short_description', ['en' => 'Only English so far.'])->save();

    $this->get('/products/flange')->assertInertia(fn ($page) => $page
        ->where('product.short_description', 'Only English so far.')
    );
});

test('empty translatable columns stay null instead of empty strings', function () {
    $product = Product::factory()->create(['description' => null]);

    expect($product->fresh()->description)->toBeNull()
        ->and($product->fresh()->toArray()['description'])->toBeNull();
});

test('product names are brand identity and are not translatable', function () {
    expect((new Product)->getTranslatableAttributes())->not->toContain('name');
});

test('section content resolves inline locale maps and keeps shared data', function () {
    $content = [
        'heading' => ['en' => 'Precision Manufacturing', 'id' => 'Manufaktur Presisi'],
        'image' => 'library/hero.jpg',
        'product_ids' => [3, 7],
        'legacy' => 'Plain string for every locale',
        'cta_label' => ['en' => 'Contact', 'id' => ''],
    ];

    expect(LocalizedContent::resolve($content, 'id'))->toBe([
        'heading' => 'Manufaktur Presisi',
        'image' => 'library/hero.jpg',
        'product_ids' => [3, 7],
        'legacy' => 'Plain string for every locale',
        'cta_label' => 'Contact',
    ]);

    expect(LocalizedContent::resolve($content, 'en')['heading'])->toBe('Precision Manufacturing');
});

test('page sections serialize their content in the request locale', function () {
    $page = Page::factory()->create(['page_type' => PageType::Homepage, 'slug' => 'home', 'status' => 'published', 'published_at' => now()->subDay()]);
    $page->sections()->create([
        'section_type' => SectionType::Hero,
        'title' => ['en' => 'Hero', 'id' => 'Hero'],
        'content' => ['heading' => ['en' => 'Built to Last', 'id' => 'Dibuat untuk Bertahan']],
        'sort_order' => 1,
        'is_active' => true,
    ]);

    $this->get('/')->assertInertia(fn ($page) => $page->where('sections.0.content.heading', 'Dibuat untuk Bertahan'));
    $this->get('/en')->assertInertia(fn ($page) => $page->where('sections.0.content.heading', 'Built to Last'));
});

test('editing in the English admin keeps the Indonesian translation', function () {
    Permission::findOrCreate('products.update', 'web');
    $user = User::factory()->create();
    $user->givePermissionTo('products.update');

    $product = Product::factory()->create(['name' => 'Bracket']);
    $product->setTranslations('short_description', ['en' => 'Old copy.', 'id' => 'Salinan lama.'])->save();

    $this->actingAs($user)->put(route('admin.products.update', $product), [
        'name' => 'Bracket',
        'short_description' => 'New English copy.',
        'status' => 'draft',
        'seo' => [],
    ])->assertRedirect();

    expect($product->fresh()->getTranslations('short_description'))->toBe([
        'en' => 'New English copy.',
        'id' => 'Salinan lama.',
    ]);
});

test('the translatable migration wraps legacy text once and unwraps on rollback', function () {
    $migration = require collect(glob(database_path('migrations/*_make_cms_text_translatable.php')))->sole();

    $id = DB::table('statistics')->insertGetId(['label' => 'Legacy label', 'value' => '10', 'order' => 0]);
    $keptId = DB::table('statistics')->insertGetId(['label' => '{"en":"Kept","id":"Tetap"}', 'value' => '1', 'order' => 1]);

    $migration->up();
    $migration->up();

    expect(DB::table('statistics')->where('id', $id)->value('label'))->toBe('{"en":"Legacy label"}')
        ->and(DB::table('statistics')->where('id', $keptId)->value('label'))->toBe('{"en":"Kept","id":"Tetap"}');

    $migration->down();

    expect(DB::table('statistics')->where('id', $id)->value('label'))->toBe('Legacy label');
});

test('the Indonesian drafts migration fills untranslated known text only and rolls back its own drafts', function () {
    $migration = require collect(glob(database_path('migrations/*_add_indonesian_drafts_for_existing_content.php')))->sole();

    $draftId = DB::table('statistics')->insertGetId(['label' => '{"en":"Employees"}', 'value' => '500', 'order' => 0]);
    $editedId = DB::table('statistics')->insertGetId(['label' => '{"en":"Employees","id":"Tenaga Kerja"}', 'value' => '1', 'order' => 1]);
    $customId = DB::table('statistics')->insertGetId(['label' => '{"en":"Custom label"}', 'value' => '2', 'order' => 2]);

    $section = PageSection::factory()->create([
        'title' => ['en' => 'Sekilas Tentang Kami'],
        'content' => [
            'primary_cta_label' => 'Contact Us',
            'primary_cta_url' => '/contact',
            'items' => [['label' => ['en' => 'Founded'], 'value' => '2017']],
        ],
    ]);

    $migration->up();
    $migration->up();

    expect(DB::table('statistics')->where('id', $draftId)->value('label'))->toBe('{"en":"Employees","id":"Karyawan"}')
        ->and(DB::table('statistics')->where('id', $editedId)->value('label'))->toBe('{"en":"Employees","id":"Tenaga Kerja"}')
        ->and(DB::table('statistics')->where('id', $customId)->value('label'))->toBe('{"en":"Custom label"}');

    $fresh = $section->fresh();
    expect($fresh->getTranslations('title'))->toBe(['en' => 'About Us at a Glance', 'id' => 'Sekilas Tentang Kami'])
        ->and($fresh->content)->toBe([
            'primary_cta_label' => ['en' => 'Contact Us', 'id' => 'Hubungi Kami'],
            'primary_cta_url' => '/contact',
            'items' => [['label' => ['en' => 'Founded', 'id' => 'Didirikan'], 'value' => '2017']],
        ]);

    $migration->down();

    $restored = $section->fresh();
    expect(DB::table('statistics')->where('id', $draftId)->value('label'))->toBe('{"en":"Employees"}')
        ->and(DB::table('statistics')->where('id', $editedId)->value('label'))->toBe('{"en":"Employees","id":"Tenaga Kerja"}')
        ->and($restored->getTranslations('title'))->toBe(['en' => 'Sekilas Tentang Kami'])
        ->and($restored->content)->toBe([
            'primary_cta_label' => 'Contact Us',
            'primary_cta_url' => '/contact',
            'items' => [['label' => 'Founded', 'value' => '2017']],
        ]);
});

test('the draft revision migration only rewrites untouched drafts', function () {
    $migration = require collect(glob(database_path('migrations/*_revise_indonesian_drafts.php')))->sole();

    $draftId = DB::table('statistics')->insertGetId(['label' => '{"en":"Metal Stamping","id":"Stamping Logam"}', 'value' => '1', 'order' => 0]);
    $editedId = DB::table('statistics')->insertGetId(['label' => '{"en":"Metal Stamping","id":"Stamping Logam Presisi"}', 'value' => '2', 'order' => 1]);
    $section = PageSection::factory()->create([
        'title' => ['en' => 'Join Our Team', 'id' => 'Bergabung dengan Tim Kami'],
        'content' => ['heading' => ['en' => 'Where We Manufacture', 'id' => 'Tempat Kami Berproduksi'], 'url' => '/careers'],
    ]);

    $migration->up();
    $migration->up();

    expect(DB::table('statistics')->where('id', $draftId)->value('label'))->toBe('{"en":"Metal Stamping","id":"Metal Stamping"}')
        ->and(DB::table('statistics')->where('id', $editedId)->value('label'))->toBe('{"en":"Metal Stamping","id":"Stamping Logam Presisi"}')
        ->and($section->fresh()->getTranslation('title', 'id'))->toBe('Bergabunglah dengan Tim Kami')
        ->and($section->fresh()->content)->toBe(['heading' => ['en' => 'Where We Manufacture', 'id' => 'Lokasi Produksi Kami'], 'url' => '/careers']);

    $migration->down();

    expect(DB::table('statistics')->where('id', $draftId)->value('label'))->toBe('{"en":"Metal Stamping","id":"Stamping Logam"}')
        ->and($section->fresh()->getTranslation('title', 'id'))->toBe('Bergabung dengan Tim Kami');
});
