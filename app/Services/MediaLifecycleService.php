<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Capability;
use App\Models\Certification;
use App\Models\Customer;
use App\Models\Facility;
use App\Models\Industry;
use App\Models\Machine;
use App\Models\Media;
use App\Models\Milestone;
use App\Models\PageSection;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\QualityContent;
use App\Models\SeoMetadata;
use App\Models\SiteSetting;
use Illuminate\Database\Eloquent\SoftDeletes;

class MediaLifecycleService
{
    public function __construct(
        private readonly MediaUploadService $uploader,
    ) {}

    /**
     * @return array<int, array{type: string, id: int|string, label: string}>
     */
    public function usages(Media $media): array
    {
        $usages = [];

        $pathReferences = [
            [Product::class, 'featured_image', 'product', 'name'],
            [Article::class, 'featured_image', 'article', 'title'],
            [Capability::class, 'featured_image', 'capability', 'name'],
            [Facility::class, 'image', 'facility', 'name'],
            [Machine::class, 'image', 'machine', 'name'],
            [Industry::class, 'image', 'industry', 'name'],
            [Milestone::class, 'image', 'milestone', 'title'],
            [QualityContent::class, 'image', 'quality_content', 'title'],
            [SeoMetadata::class, 'og_image', 'seo_metadata', 'meta_title'],
            [ProductImage::class, 'path', 'product_image', 'alt_text'],
        ];

        foreach ($pathReferences as [$modelClass, $column, $type, $labelColumn]) {
            $this->appendModelUsages($usages, $modelClass, $column, $media->path, $type, $labelColumn);
        }

        $foreignKeyReferences = [
            [Certification::class, 'media_id', 'certification', 'name'],
            [ProductImage::class, 'media_id', 'product_image', 'alt_text'],
            [Customer::class, 'logo_media_id', 'customer', 'name'],
        ];

        foreach ($foreignKeyReferences as [$modelClass, $column, $type, $labelColumn]) {
            $this->appendModelUsages($usages, $modelClass, $column, $media->id, $type, $labelColumn);
        }

        foreach (SiteSetting::query()->where('type', 'image')->where('value', $media->path)->get() as $setting) {
            $usages["site_setting:{$setting->id}"] = [
                'type' => 'site_setting',
                'id' => $setting->id,
                'label' => $setting->key,
            ];
        }

        foreach (PageSection::query()->get(['id', 'section_type', 'title', 'content']) as $section) {
            if (! $this->containsPath($section->content, $media->path)) {
                continue;
            }

            $usages["page_section:{$section->id}"] = [
                'type' => 'page_section',
                'id' => $section->id,
                'label' => $section->title ?: $section->section_type->label(),
            ];
        }

        return array_values($usages);
    }

    public function isInUse(Media $media): bool
    {
        return $this->usages($media) !== [];
    }

    public function deleteIfUnmanaged(?string $path): void
    {
        if (! $path || Media::query()->where('path', $path)->exists()) {
            return;
        }

        $this->uploader->deletePublic($path);
    }

    /**
     * @param  array<string, array{type: string, id: int|string, label: string}>  $usages
     * @param  class-string  $modelClass
     */
    private function appendModelUsages(
        array &$usages,
        string $modelClass,
        string $column,
        int|string $value,
        string $type,
        string $labelColumn,
    ): void {
        $query = $modelClass::query();

        if (in_array(SoftDeletes::class, class_uses_recursive($modelClass), true)) {
            $query->withTrashed();
        }

        foreach ($query->where($column, $value)->get() as $record) {
            $label = trim((string) $record->getAttribute($labelColumn));
            $id = $record->getKey();

            $usages["{$type}:{$id}"] = [
                'type' => $type,
                'id' => $id,
                'label' => $label !== '' ? $label : ucwords(str_replace('_', ' ', $type))." #{$id}",
            ];
        }
    }

    private function containsPath(mixed $value, string $path): bool
    {
        if (is_string($value)) {
            return $value === $path;
        }

        if (! is_array($value)) {
            return false;
        }

        foreach ($value as $nestedValue) {
            if ($this->containsPath($nestedValue, $path)) {
                return true;
            }
        }

        return false;
    }
}
