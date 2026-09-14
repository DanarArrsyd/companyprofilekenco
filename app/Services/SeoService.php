<?php

namespace App\Services;

use App\Models\SeoMetadata;
use Illuminate\Database\Eloquent\Model;

class SeoService
{
    /**
     * Resolve final SEO metadata for a public page, applying the fallback
     * chain: custom SEO -> content title + company name -> global default.
     *
     * @param  Model  $model  A model using the HasSeoMetadata trait.
     */
    public function resolve(Model $model, string $fallbackTitle, ?string $fallbackDescription = null): array
    {
        /** @var SeoMetadata|null $seo */
        $seo = $model->seoMetadata;
        $appName = config('app.name');

        $title = $seo?->meta_title ?: "{$fallbackTitle} - {$appName}";
        $description = $seo?->meta_description ?: $fallbackDescription;

        return [
            'title' => $title,
            'description' => $description,
            'canonical_url' => $seo?->canonical_url,
            'og_title' => $seo?->og_title ?: $title,
            'og_description' => $seo?->og_description ?: $description,
            'og_image' => $seo?->og_image,
            'robots_index' => $seo?->robots_index ?? true,
            'robots_follow' => $seo?->robots_follow ?? true,
        ];
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
            'robots_index' => false,
            'robots_follow' => false,
        ];
    }
}
