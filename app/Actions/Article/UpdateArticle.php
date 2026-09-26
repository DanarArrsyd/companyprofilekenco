<?php

namespace App\Actions\Article;

use App\Models\Article;
use App\Services\ActivityLogService;
use App\Services\MediaLifecycleService;
use App\Services\MediaUploadService;
use App\Services\SeoService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UpdateArticle
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
        private readonly MediaUploadService $media,
        private readonly MediaLifecycleService $mediaLifecycle,
        private readonly SeoService $seo,
    ) {}

    public function handle(Article $article, array $data): Article
    {
        $featuredImage = $article->featured_image;

        // A submitted featured_image_path replaces the image; an empty one
        // removes it. Leaving the key out keeps the current image.
        if (isset($data['featured_image']) && $data['featured_image'] !== null) {
            $featuredImage = $this->media->storePublicImage($data['featured_image'], 'articles');
        } elseif (array_key_exists('featured_image_path', $data)) {
            $featuredImage = $data['featured_image_path'];
        }

        if ($featuredImage !== $article->featured_image) {
            $this->mediaLifecycle->deleteIfUnmanaged($article->featured_image);
        }

        return DB::transaction(function () use ($data, $article, $featuredImage) {
            $article->update([
                'translations' => $data['translations'] ?? [],
                'slug' => $data['slug'] ?? $article->slug,
                'news_category_id' => $data['news_category_id'] ?? null,
                'title' => $data['title'],
                'excerpt' => $data['excerpt'] ?? null,
                'content' => $data['content'] ?? null,
                'featured_image' => $featuredImage,
                'is_featured' => $data['is_featured'] ?? false,
                'status' => $data['status'],
                'published_at' => $data['published_at'] ?? null,
                'updated_by' => Auth::id(),
            ]);

            $this->seo->saveMetadata($article, $data['seo'] ?? [], $this->media, 'seo/news');

            $this->activityLog->record('article.updated', $article, ['title' => $article->title]);

            return $article->fresh();
        });
    }
}
