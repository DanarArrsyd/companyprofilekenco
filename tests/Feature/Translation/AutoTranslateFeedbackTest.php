<?php

use App\Models\Product;
use App\Models\User;
use App\Services\Translation\Translator;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config([
        'translation.azure.key' => 'test-key',
        'translation.azure.endpoint' => 'https://translator.test',
        'translation.glossary' => [],
    ]);

    $this->seed(RolePermissionSeeder::class);
    $this->admin = tap(User::factory()->create())->assignRole('Super Admin');
});

function echoTranslator(): void
{
    Http::fake(['translator.test/*' => function (Request $request) {
        parse_str((string) parse_url($request->url(), PHP_URL_QUERY), $query);

        return Http::response(array_map(fn ($item) => ['translations' => [['text' => '['.$query['to'].'] '.$item['Text']]]], $request->data()));
    }]);
}

function saveTranslated(array $fields, string $source = 'en')
{
    $product = Product::factory()->create(['name' => 'Bracket']);
    $product->setTranslations('short_description', ['en' => 'Old', 'id' => 'Lama'])->saveQuietly();

    return test()->actingAs(test()->admin)
        ->withHeaders(['X-Auto-Translate' => '1', 'X-Auto-Translate-Source' => $source])
        ->put(route('admin.products.update', $product), ['name' => 'Bracket', 'status' => 'draft', ...$fields]);
}

test('a translated save reports how many texts were updated and in which direction', function () {
    echoTranslator();

    saveTranslated(['short_description' => 'New bracket', 'translations' => ['id' => ['short_description' => 'Lama']]])
        ->assertSessionHas('autoTranslate', ['status' => 'translated', 'count' => 1, 'from' => 'en', 'to' => 'id']);
});

test('a save with nothing to translate says so', function () {
    echoTranslator();

    saveTranslated(['short_description' => '', 'translations' => ['id' => ['short_description' => 'Lama']]])
        ->assertSessionHas('autoTranslate', ['status' => 'unchanged', 'count' => 0, 'from' => 'en', 'to' => 'id']);
});

test('an Azure rejection reports Azure\'s own reason and keeps the edit', function () {
    Http::fake(['translator.test/*' => Http::response(['error' => ['code' => 401000, 'message' => 'The request is not authorized because credentials are missing or invalid.']], 401)]);

    saveTranslated(['short_description' => 'New bracket', 'translations' => ['id' => ['short_description' => 'Lama']]])
        ->assertSessionHas('autoTranslate', fn (array $report) => $report['status'] === 'failed'
            && str_contains($report['reason'], '401000')
            && str_contains($report['reason'], 'credentials are missing or invalid'));
});

test('saves without the option send no report', function () {
    Http::fake();
    $product = Product::factory()->create();

    $this->actingAs($this->admin)->put(route('admin.products.update', $product), ['name' => $product->name, 'status' => 'draft'])
        ->assertSessionMissing('autoTranslate');
});

test('the settings connection test shows a sample translation', function () {
    echoTranslator();

    $this->actingAs($this->admin)->post(route('admin.settings.translator-test'))
        ->assertRedirect()
        ->assertSessionHas('success', fn (string $message) => str_contains($message, '[id] Precision parts for the automotive industry.'));
});

test('the settings connection test explains a failure', function () {
    Http::fake(['translator.test/*' => Http::response(['error' => ['code' => 401001, 'message' => 'Invalid region.']], 401)]);

    $this->actingAs($this->admin)->post(route('admin.settings.translator-test'))
        ->assertSessionHas('error', fn (string $message) => str_contains($message, '401001') && str_contains($message, 'Invalid region.'));
});

test('the settings connection test says when no key is configured', function () {
    config(['translation.azure.key' => null]);
    app()->forgetInstance(Translator::class);

    $this->actingAs($this->admin)->post(route('admin.settings.translator-test'))
        ->assertSessionHas('error', fn (string $message) => str_contains($message, 'AZURE_TRANSLATOR_KEY'));
});

test('settings show whether translation is configured and for which region', function () {
    config(['translation.azure.region' => 'southeastasia']);

    $this->actingAs($this->admin)->get(route('admin.settings'))
        ->assertInertia(fn ($page) => $page->where('translator', ['configured' => true, 'region' => 'southeastasia']));
});
