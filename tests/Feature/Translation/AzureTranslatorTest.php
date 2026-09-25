<?php

use App\Services\Translation\AzureTranslator;
use App\Services\Translation\TranslationFailed;
use App\Services\Translation\Translator;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config([
        'translation.azure.key' => 'test-key',
        'translation.azure.region' => 'southeastasia',
        'translation.azure.endpoint' => 'https://translator.test',
        'translation.glossary' => ['Metal Stamping', 'Kenco'],
    ]);
});

/** Echo each submitted text back, prefixed, so the test sees what was sent. */
function fakeAzure(): void
{
    Http::fake(['translator.test/*' => fn (Request $request) => Http::response(
        array_map(fn ($item) => ['translations' => [['text' => 'T:'.$item['Text'], 'to' => 'id']]], $request->data()),
    )]);
}

test('sends one request with the Azure query, headers and body', function () {
    fakeAzure();

    app(Translator::class)->translate(['Hello', 'World'], 'en', 'id');

    Http::assertSentCount(1);
    Http::assertSent(fn (Request $request) => str_starts_with($request->url(), 'https://translator.test/translate?')
        && str_contains($request->url(), 'api-version=3.0')
        && str_contains($request->url(), 'from=en')
        && str_contains($request->url(), 'to=id')
        && str_contains($request->url(), 'textType=html')
        && $request->header('Ocp-Apim-Subscription-Key') === ['test-key']
        && $request->header('Ocp-Apim-Subscription-Region') === ['southeastasia']
        && $request->data() === [['Text' => 'Hello'], ['Text' => 'World']]);
});

test('glossary terms are protected from translation and restored afterwards', function () {
    fakeAzure();

    $result = app(Translator::class)->translate(['We do metal stamping for Kenco.'], 'en', 'id');

    Http::assertSent(fn (Request $request) => $request->data()[0]['Text']
        === 'We do <span class="notranslate">metal stamping</span> for <span class="notranslate">Kenco</span>.');
    expect($result)->toBe(['T:We do metal stamping for Kenco.']);
});

test('plain text is escaped for the call, keeps its line breaks and comes back decoded', function () {
    fakeAzure();

    $result = app(Translator::class)->translate(["Size < 5 mm & \"flat\"\nSecond line"], 'en', 'id');

    Http::assertSent(fn (Request $request) => $request->data()[0]['Text'] === 'Size &lt; 5 mm &amp; &quot;flat&quot;<br>Second line');
    expect($result)->toBe(["T:Size < 5 mm & \"flat\"\nSecond line"]);
});

test('html is sent as markup and returned as markup', function () {
    fakeAzure();

    $result = app(Translator::class)->translate(['<p>Hello <a href="/x">link</a></p>'], 'en', 'id');

    expect($result)->toBe(['T:<p>Hello <a href="/x">link</a></p>']);
});

test('an HTTP error or a dropped connection throws TranslationFailed', function (Closure $fake) {
    Http::fake(['translator.test/*' => $fake]);

    app(Translator::class)->translate(['Hello'], 'en', 'id');
})->with([
    'quota exceeded' => fn () => fn () => Http::response(['error' => ['code' => 403001]], 403),
    'server error' => fn () => fn () => Http::response('', 500),
    'connection' => fn () => fn () => throw new Illuminate\Http\Client\ConnectionException('timeout'),
])->throws(TranslationFailed::class);

test('without a key the translator reports itself unconfigured and never calls out', function () {
    config(['translation.azure.key' => null]);
    Http::fake();

    expect(app(Translator::class)->isConfigured())->toBeFalse();
    expect(fn () => app(Translator::class)->translate(['Hello'], 'en', 'id'))->toThrow(TranslationFailed::class);
    Http::assertNothingSent();
});

test('an empty list makes no request', function () {
    Http::fake();

    expect(app(Translator::class)->translate([], 'en', 'id'))->toBe([]);
    Http::assertNothingSent();
});
