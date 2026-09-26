<?php

use App\Enums\SectionType;
use App\Models\Page;
use App\Models\PageSection;
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

function sectionWith(SectionType $type, array $content): PageSection
{
    $section = PageSection::factory()->for(Page::factory())->create(['section_type' => $type, 'subtitle' => null, 'content' => $content]);
    // A title that already has both languages, so only content is translated.
    $section->setTranslations('title', ['en' => 'Section', 'id' => 'Bagian'])->saveQuietly();

    return $section->fresh();
}

/** Save the section the way PageSectionEditor does. */
function saveSection(PageSection $section, array $content, bool $autoTranslate = true, string $source = 'en')
{
    return test()->actingAs(test()->admin)
        ->withHeaders($autoTranslate ? ['X-Auto-Translate' => '1', 'X-Auto-Translate-Source' => $source] : [])
        ->put(route('admin.pages.sections.update', [$section->page_id, $section->id]), [
            'section_type' => $section->section_type->value,
            'title' => 'Section',
            'translations' => ['id' => ['title' => 'Bagian']],
            'content' => $content,
            'is_active' => true,
        ]);
}

test('an English edit of section text regenerates the Indonesian text', function () {
    $section = sectionWith(SectionType::Hero, ['heading' => 'Old', 'image' => 'library/hero.webp', 'primary_cta_url' => '/contact']);

    saveSection($section, ['heading' => 'Precision parts', 'image' => 'library/hero.webp', 'primary_cta_url' => '/contact'])
        ->assertSessionHasNoErrors();

    expect($section->fresh()->content)->toBe([
        'heading' => ['en' => 'Precision parts', 'id' => '[id] Precision parts'],
        'image' => 'library/hero.webp',
        'primary_cta_url' => '/contact',
    ]);
});

test('saving from the Indonesian tab regenerates the English text', function () {
    $section = sectionWith(SectionType::Hero, ['heading' => ['en' => 'Old', 'id' => 'Lama']]);

    saveSection($section, ['heading' => ['en' => 'Old', 'id' => 'Komponen presisi']], source: 'id');

    expect($section->fresh()->content['heading'])->toBe(['en' => '[en] Komponen presisi', 'id' => 'Komponen presisi']);
});

test('stat labels are translated and shared values are never sent', function () {
    $section = sectionWith(SectionType::Stats, ['items' => [['value' => '25+', 'label' => 'Years']]]);

    saveSection($section, ['items' => [['value' => '25+', 'label' => 'Years of experience']]]);

    expect($section->fresh()->content['items'][0])->toBe(['value' => '25+', 'label' => ['en' => 'Years of experience', 'id' => '[id] Years of experience']]);
    // Only text is sent: the section title and the stat label, never the value.
    Http::assertSent(fn (Request $request) => in_array(['Text' => 'Years of experience'], $request->data(), true)
        && ! in_array(['Text' => '25+'], $request->data(), true));
});

test('untouched section text without Indonesian is filled in', function () {
    $section = sectionWith(SectionType::VisionMission, ['visi_title' => 'Vision', 'visi_text' => 'Lead the region.']);

    saveSection($section, ['visi_title' => 'Vision', 'visi_text' => 'Lead the region.']);

    expect($section->fresh()->content)->toBe([
        'visi_title' => ['en' => 'Vision', 'id' => '[id] Vision'],
        'visi_text' => ['en' => 'Lead the region.', 'id' => '[id] Lead the region.'],
    ]);
});

test('section text edited in both languages is kept as typed', function () {
    $section = sectionWith(SectionType::Hero, ['heading' => ['en' => 'Old', 'id' => 'Lama']]);

    saveSection($section, ['heading' => ['en' => 'New', 'id' => 'Baru']]);

    expect($section->fresh()->content['heading'])->toBe(['en' => 'New', 'id' => 'Baru']);
    Http::assertNotSent(fn (Request $request) => in_array(['Text' => 'New'], $request->data(), true));
});

test('without the header section content is saved as sent', function () {
    $section = sectionWith(SectionType::Hero, ['heading' => 'Old']);

    saveSection($section, ['heading' => 'New'], autoTranslate: false);

    expect($section->fresh()->content)->toBe(['heading' => 'New']);
    Http::assertNothingSent();
});
