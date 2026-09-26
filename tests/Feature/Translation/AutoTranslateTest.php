<?php

use App\Models\Article;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config([
        'translation.azure.key' => 'test-key',
        'translation.azure.endpoint' => 'https://translator.test',
        'translation.glossary' => [],
    ]);

    // "[id] text" when translating to Indonesian, "[en] text" the other way.
    Http::fake(['translator.test/*' => function (Request $request) {
        parse_str((string) parse_url($request->url(), PHP_URL_QUERY), $query);

        return Http::response(array_map(
            fn ($item) => ['translations' => [['text' => '['.$query['to'].'] '.$item['Text']]]],
            $request->data(),
        ));
    }]);

    $this->seed(RolePermissionSeeder::class);
    $this->admin = tap(User::factory()->create())->assignRole('Super Admin');
});

/** Save a product the way its Edit form does, with auto-translate on and the given tab active. */
function saveProduct(Product $product, array $fields, bool $autoTranslate = true, string $source = 'en')
{
    return test()->actingAs(test()->admin)
        ->withHeaders($autoTranslate ? ['X-Auto-Translate' => '1', 'X-Auto-Translate-Source' => $source] : [])
        ->put(route('admin.products.update', $product), [
            'name' => $product->name,
            'status' => 'draft',
            ...$fields,
        ]);
}

function productWith(array $shortDescription): Product
{
    $product = Product::factory()->create();
    $product->setTranslations('short_description', $shortDescription)->saveQuietly();

    return $product->fresh();
}

test('an English edit regenerates the Indonesian text', function () {
    $product = productWith(['en' => 'Old', 'id' => 'Lama']);

    saveProduct($product, ['short_description' => 'New bracket', 'translations' => ['id' => ['short_description' => 'Lama']]])
        ->assertSessionHasNoErrors();

    expect($product->fresh()->getTranslations('short_description'))->toBe(['en' => 'New bracket', 'id' => '[id] New bracket']);
});

test('saving from the Indonesian tab regenerates the English text', function () {
    $product = productWith(['en' => 'Old', 'id' => 'Lama']);

    saveProduct($product, ['short_description' => 'Old', 'translations' => ['id' => ['short_description' => 'Braket baru']]], source: 'id');

    expect($product->fresh()->getTranslations('short_description'))->toBe(['en' => '[en] Braket baru', 'id' => 'Braket baru']);
});

test('editing both languages keeps both as typed and makes no request', function () {
    $product = productWith(['en' => 'Old', 'id' => 'Lama']);

    saveProduct($product, ['short_description' => 'New', 'translations' => ['id' => ['short_description' => 'Baru']]]);

    expect($product->fresh()->getTranslations('short_description'))->toBe(['en' => 'New', 'id' => 'Baru']);
    Http::assertNothingSent();
});

test('an untouched field with no Indonesian yet is filled in', function () {
    $product = productWith(['en' => 'Bracket']);

    saveProduct($product, ['short_description' => 'Bracket']);

    expect($product->fresh()->getTranslation('short_description', 'id', false))->toBe('[id] Bracket');
});

test('saving from the English tab re-syncs Indonesian text that no longer matches', function () {
    $product = productWith(['en' => 'ISO 9001 certified bracket', 'id' => 'Braket bersertifikat IATF']);

    saveProduct($product, ['short_description' => 'ISO 9001 certified bracket', 'translations' => ['id' => ['short_description' => 'Braket bersertifikat IATF']]]);

    expect($product->fresh()->getTranslation('short_description', 'id', false))->toBe('[id] ISO 9001 certified bracket');
});

test('an Indonesian edit made before switching to the English tab is kept', function () {
    $product = productWith(['en' => 'Bracket', 'id' => 'Braket']);

    saveProduct($product, ['short_description' => 'Bracket', 'translations' => ['id' => ['short_description' => 'Braket baja']]]);

    expect($product->fresh()->getTranslations('short_description'))->toBe(['en' => 'Bracket', 'id' => 'Braket baja']);
});

test('clearing the source does not wipe the other language', function () {
    $product = productWith(['en' => 'Bracket', 'id' => 'Braket']);

    saveProduct($product, ['short_description' => '', 'translations' => ['id' => ['short_description' => 'Braket']]]);

    expect($product->fresh()->getTranslation('short_description', 'id', false))->toBe('Braket');
});

test('without the header nothing is translated', function () {
    $product = productWith(['en' => 'Old', 'id' => 'Lama']);

    saveProduct($product, ['short_description' => 'New', 'translations' => ['id' => ['short_description' => 'Lama']]], autoTranslate: false);

    expect($product->fresh()->getTranslations('short_description'))->toBe(['en' => 'New', 'id' => 'Lama']);
    Http::assertNothingSent();
});

test('SEO fields are translated too', function () {
    $product = productWith(['en' => 'Bracket', 'id' => 'Braket']);

    saveProduct($product, [
        'short_description' => 'Bracket',
        'translations' => ['id' => ['short_description' => 'Braket']],
        'seo' => ['meta_title' => 'Steel brackets'],
    ]);

    expect($product->fresh()->seoMetadata->getTranslation('meta_title', 'id', false))->toBe('[id] Steel brackets');
});

test('article HTML keeps its markup', function () {
    $article = Article::factory()->create();

    $this->actingAs($this->admin)->withHeaders(['X-Auto-Translate' => '1'])
        ->put(route('admin.news.update', $article), [
            'title' => $article->title,
            'content' => '<p>New <strong>line</strong></p>',
            'status' => 'draft',
        ])->assertSessionHasNoErrors();

    expect($article->fresh()->getTranslation('content', 'id', false))->toBe('[id] <p>New <strong>line</strong></p>');
});

test('a translator failure still saves the edit and warns the admin', function () {
    config(['translation.azure.endpoint' => 'https://broken.example']);
    app()->forgetInstance(App\Services\Translation\Translator::class);
    Http::fake(['broken.example/*' => Http::response('', 500)]);
    $product = productWith(['en' => 'Old', 'id' => 'Lama']);

    saveProduct($product, ['short_description' => 'New', 'translations' => ['id' => ['short_description' => 'Lama']]])
        ->assertSessionHas('warning', 'Automatic translation failed; the other language was not changed.');

    expect($product->fresh()->getTranslations('short_description'))->toBe(['en' => 'New', 'id' => 'Lama']);
});

test('the admin sees the option only when a translator is configured', function () {
    $this->actingAs($this->admin)->get(route('admin.products'))->assertInertia(fn ($page) => $page->where('autoTranslate', true));

    config(['translation.azure.key' => null]);
    app()->forgetInstance(App\Services\Translation\Translator::class);

    $this->actingAs($this->admin)->get(route('admin.products'))->assertInertia(fn ($page) => $page->where('autoTranslate', false));
});
