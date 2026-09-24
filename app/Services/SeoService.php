<?php

namespace App\Services;

use App\Models\SeoMetadata;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Single source of truth for resolved public SEO metadata — every public
 * controller funnels through resolve()/resolveStatic()/homepage()/preview()
 * instead of hand-building a metadata array, so the fallback chain, title
 * format, canonical default, and OG/Twitter resolution stay in one place.
 */
class SeoService
{
    public function __construct(
        private readonly SettingsService $settings,
        private readonly Request $request,
    ) {}

    /**
     * Resolve metadata for a model-backed detail page (Product, Capability,
     * Article, JobVacancy, Page). Falls back: SEO override -> entity
     * title/description -> site default.
     *
     * @param  Model  $model  A model using the HasSeoMetadata trait.
     */
    public function resolve(Model $model, string $fallbackTitle, ?string $fallbackDescription = null, ?string $entityImage = null, string $ogType = 'website'): array
    {
        /** @var SeoMetadata|null $seo */
        $seo = $model->seoMetadata;

        // An explicit admin override is used verbatim — only the derived
        // fallback (entity title) gets the "Title | Company" treatment.
        $title = $seo?->meta_title ?: $this->formatTitle($fallbackTitle);
        $description = $seo?->meta_description ?: $fallbackDescription ?: $this->settings->get('seo_default_meta_description');

        return $this->finalize($seo, $title, $description, $entityImage, $ogType);
    }

    /**
     * Resolve metadata for a static/listing page with no SEO-metadata
     * record of its own (Products index, Facilities, Contact, etc.).
     */
    public function resolveStatic(string $title, ?string $description = null, ?string $image = null): array
    {
        return $this->finalize(null, $this->formatTitle($title), $description ?: $this->settings->get('seo_default_meta_description'), $image);
    }

    /**
     * Homepage title is the company name alone (or an explicit override —
     * the Homepage Page's own SEO metadata, if set), never
     * "Company Name | Company Name".
     */
    public function homepage(?Model $page = null): array
    {
        /** @var SeoMetadata|null $seo */
        $seo = $page?->seoMetadata;
        $companyName = $this->settings->get('company_name') ?: config('app.name');
        $title = $seo?->meta_title ?: $companyName;
        $description = $seo?->meta_description ?: $this->settings->get('seo_default_meta_description');

        return $this->finalize($seo, $title, $description, null);
    }

    /**
     * Persist an entity's admin-submitted SEO panel data (meta/canonical/
     * robots/OG) — the one place every Create/Update Action calls instead
     * of writing $model->seoMetadata()->updateOrCreate() by hand. Resolves
     * the OG image the same way every other admin image field works: a
     * fresh upload wins, then a Media Library path, then the existing value.
     */
    public function saveMetadata(Model $model, array $seoInput, MediaUploadService $media, string $directory): void
    {
        $ogImage = match (true) {
            isset($seoInput['og_image']) && $seoInput['og_image'] instanceof UploadedFile => $media->storePublicImage($seoInput['og_image'], $directory),
            ! empty($seoInput['og_image_path']) => $seoInput['og_image_path'],
            default => $model->seoMetadata?->og_image,
        };

        $metadata = $model->seoMetadata()->updateOrCreate([], [
            'meta_title' => $seoInput['meta_title'] ?? null,
            'meta_description' => $seoInput['meta_description'] ?? null,
            'canonical_url' => $seoInput['canonical_url'] ?? null,
            'og_title' => $seoInput['og_title'] ?? null,
            'og_description' => $seoInput['og_description'] ?? null,
            'og_image' => $ogImage,
            'robots_index' => $seoInput['robots_index'] ?? true,
            'robots_follow' => $seoInput['robots_follow'] ?? true,
        ]);

        $metadata->applyTranslations($seoInput['translations'] ?? []);

        if ($metadata->isDirty()) {
            $metadata->save();
        }
    }

    /**
     * SEO metadata for a draft/unpublished preview: never indexable.
     */
    public function preview(string $title): array
    {
        return [
            'title' => "[Preview] {$title}",
            'description' => null,
            'canonical_url' => null,
            'og_title' => null,
            'og_description' => null,
            'og_image' => null,
            'og_type' => 'website',
            'twitter_card' => 'summary',
            'twitter_title' => null,
            'twitter_description' => null,
            'twitter_image' => null,
            'robots_index' => false,
            'robots_follow' => false,
        ];
    }

    /**
     * Shared finishing pass: canonical default, robots default, OG/Twitter
     * fallback chain, absolute image URLs. Every public resolution path
     * (resolve/resolveStatic/homepage) ends here.
     */
    private function finalize(?SeoMetadata $seo, string $title, ?string $description, ?string $entityImage, string $ogType = 'website'): array
    {
        $ogTitle = $seo?->og_title ?: $title;
        $ogDescription = $seo?->og_description ?: $description;
        $ogImage = $this->absoluteImageUrl($seo?->og_image ?: $entityImage ?: $this->settings->get('seo_default_og_image'));

        [$robotsIndex, $robotsFollow] = $this->resolveRobots($seo);

        // Non-production environments must never be indexable, regardless
        // of any per-page setting — this is the single source of truth for
        // that rule so it can never collide with the per-page robots tag.
        if (! app()->environment('production')) {
            [$robotsIndex, $robotsFollow] = [false, false];
        }

        return [
            'title' => $title,
            'description' => $description,
            'canonical_url' => $seo?->canonical_url ?: $this->canonicalUrl(),
            'og_title' => $ogTitle,
            'og_description' => $ogDescription,
            'og_image' => $ogImage,
            'og_type' => $ogType,
            'twitter_card' => $ogImage ? ($this->settings->get('seo_twitter_card_type') ?: 'summary_large_image') : 'summary',
            'twitter_title' => $ogTitle,
            'twitter_description' => $ogDescription,
            'twitter_image' => $ogImage,
            'twitter_site' => $this->settings->get('seo_twitter_username') ?: null,
            'robots_index' => $robotsIndex,
            'robots_follow' => $robotsFollow,
        ];
    }

    /**
     * "Entity Title | Company Name" — skips the separator/company suffix
     * entirely if the resolved title already equals the company name
     * (avoids "Company Name | Company Name" on the homepage override case).
     */
    private function formatTitle(string $resolvedTitle): string
    {
        $companyName = $this->settings->get('company_name') ?: config('app.name');

        if ($resolvedTitle === $companyName) {
            return $resolvedTitle;
        }

        $separator = $this->settings->get('seo_title_separator') ?: '|';

        return "{$resolvedTitle} {$separator} {$companyName}";
    }

    /**
     * Default robots directive: SEO override wins; otherwise the
     * site-wide default from Settings ("index,follow" if unset).
     */
    private function resolveRobots(?SeoMetadata $seo): array
    {
        if ($seo && ($seo->robots_index !== null || $seo->robots_follow !== null)) {
            return [$seo->robots_index ?? true, $seo->robots_follow ?? true];
        }

        $default = $this->settings->get('seo_default_robots') ?: 'index,follow';

        return [str_contains($default, 'noindex') === false, str_contains($default, 'nofollow') === false];
    }

    /**
     * The current request's normalized absolute URL — the safe default
     * canonical for any indexable page. Preserves query strings (category
     * filters, pagination) since those represent distinct content; only
     * forces https when running in production.
     */
    private function canonicalUrl(): string
    {
        $url = $this->request->fullUrl();

        if (app()->environment('production') && str_starts_with($url, 'http://')) {
            $url = 'https://'.substr($url, 7);
        }

        return rtrim(preg_replace('#(?<!:)//+#', '/', $url), '/') ?: $url;
    }

    /**
     * Resolve a stored public-disk path to an absolute URL. Already-absolute
     * URLs (an admin-entered external image URL) pass through unchanged.
     */
    private function absoluteImageUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return url(Storage::disk('public')->url($path));
    }
}
