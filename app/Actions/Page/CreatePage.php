<?php

namespace App\Actions\Page;

use App\Enums\PageType;
use App\Models\Page;
use App\Services\ActivityLogService;
use App\Support\SlugGenerator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CreatePage
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(array $data): Page
    {
        $slug = trim($data['slug'] ?? '') !== ''
            ? $data['slug']
            : SlugGenerator::unique('pages', $data['title']);

        return DB::transaction(function () use ($data, $slug) {
            $page = Page::create([
                'title' => $data['title'],
                'slug' => $slug,
                'page_type' => PageType::Standard,
                'status' => $data['status'],
                'published_at' => $data['published_at'] ?? null,
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ]);

            $page->seoMetadata()->create($data['seo'] ?? []);

            $this->activityLog->record('page.created', $page, ['title' => $page->title]);

            return $page;
        });
    }
}
