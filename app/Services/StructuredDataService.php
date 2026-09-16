<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Capability;
use App\Models\JobVacancy;
use Illuminate\Support\Facades\Storage;

/**
 * Builds JSON-LD structured-data payloads from real site/entity data only.
 * Every method returns a plain array ready to hand to the JsonLd component
 * (or null when the entity doesn't have enough real data to justify the
 * schema at all — no schema beats a misleading one).
 */
class StructuredDataService
{
    public function __construct(
        private readonly SettingsService $settings,
    ) {}

    public function organization(): array
    {
        $data = [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => $this->settings->get('company_name') ?: config('app.name'),
            'url' => url('/'),
            'logo' => $this->absoluteUrl($this->settings->get('logo')),
            'email' => $this->settings->get('email'),
            'telephone' => $this->settings->get('phone'),
        ];

        if ($address = $this->settings->get('address')) {
            $data['address'] = ['@type' => 'PostalAddress', 'streetAddress' => $address];
        }

        $sameAs = array_values(array_filter([
            $this->settings->get('social_linkedin'),
            $this->settings->get('social_youtube'),
            $this->settings->get('social_instagram'),
        ]));

        if ($sameAs !== []) {
            $data['sameAs'] = $sameAs;
        }

        return $this->prune($data);
    }

    public function website(): array
    {
        return $this->prune([
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            'name' => $this->settings->get('company_name') ?: config('app.name'),
            'url' => url('/'),
        ]);
    }

    /**
     * @param  array<int, array{label: string, href?: string|null}>  $items  The exact same breadcrumb items the UI <Breadcrumb> renders.
     */
    public function breadcrumbList(array $items): ?array
    {
        if (count($items) < 2) {
            return null;
        }

        $list = [];

        foreach (array_values($items) as $index => $item) {
            $list[] = $this->prune([
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => $item['label'],
                'item' => ! empty($item['href']) ? url($item['href']) : null,
            ]);
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => $list,
        ];
    }

    public function article(Article $article, ?string $canonicalUrl): array
    {
        $data = [
            '@context' => 'https://schema.org',
            '@type' => 'NewsArticle',
            'headline' => $article->title,
            'description' => $article->excerpt,
            'datePublished' => $article->published_at?->toAtomString(),
            'dateModified' => $article->updated_at?->toAtomString(),
            'publisher' => $this->organization(),
        ];

        if ($article->featured_image) {
            $data['image'] = [$this->absoluteUrl($article->featured_image)];
        }

        if ($article->author) {
            $data['author'] = ['@type' => 'Person', 'name' => $article->author->name];
        }

        if ($canonicalUrl) {
            $data['mainEntityOfPage'] = ['@type' => 'WebPage', '@id' => $canonicalUrl];
        }

        return $this->prune($data);
    }

    /**
     * Google requires removing JobPosting markup once a vacancy closes, and
     * a posting with no real description is more misleading than useful —
     * both return null (page renders with no schema at all).
     */
    public function jobPosting(JobVacancy $vacancy): ?array
    {
        if (! $vacancy->isOpen() || ! $vacancy->description) {
            return null;
        }

        $data = [
            '@context' => 'https://schema.org',
            '@type' => 'JobPosting',
            'title' => $vacancy->title,
            'description' => $vacancy->description,
            'datePosted' => $vacancy->published_at?->toDateString(),
            'validThrough' => $vacancy->closes_at?->toAtomString(),
            'hiringOrganization' => [
                '@type' => 'Organization',
                'name' => $this->settings->get('company_name') ?: config('app.name'),
                'sameAs' => url('/'),
            ],
            'employmentType' => $this->mapEmploymentType($vacancy->employment_type),
        ];

        if ($vacancy->location) {
            $data['jobLocation'] = [
                '@type' => 'Place',
                'address' => ['@type' => 'PostalAddress', 'addressLocality' => $vacancy->location],
            ];
        }

        return $this->prune($data);
    }

    public function service(Capability $capability): array
    {
        return $this->prune([
            '@context' => 'https://schema.org',
            '@type' => 'Service',
            'name' => $capability->name,
            'description' => $capability->summary ?: $capability->description,
            'provider' => $this->organization(),
        ]);
    }

    /**
     * schema.org's employmentType enum only accepts a fixed set of values —
     * map the admin's free-text field only when it maps unambiguously,
     * otherwise omit the property rather than guess.
     */
    private function mapEmploymentType(?string $raw): ?string
    {
        return match (strtolower(trim($raw ?? ''))) {
            'full-time', 'full time', 'fulltime' => 'FULL_TIME',
            'part-time', 'part time', 'parttime' => 'PART_TIME',
            'contract', 'contractor' => 'CONTRACTOR',
            'internship', 'intern' => 'INTERN',
            'temporary' => 'TEMPORARY',
            default => null,
        };
    }

    private function absoluteUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return url(Storage::disk('public')->url($path));
    }

    /** Recursively drop null/empty values so schema output never contains empty fields. */
    private function prune(array $data): array
    {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = $this->prune($value);
                if ($data[$key] === []) {
                    unset($data[$key]);
                }
                continue;
            }

            if ($value === null || $value === '') {
                unset($data[$key]);
            }
        }

        return $data;
    }
}
