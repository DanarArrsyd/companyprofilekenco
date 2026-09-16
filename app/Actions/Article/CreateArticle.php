<?php

namespace App\Actions\Article;

use App\Models\Article;
use App\Services\ActivityLogService;
use App\Services\MediaUploadService;
use App\Services\SeoService;
use App\Support\SlugGenerator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CreateArticle
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
        private readonly MediaUploadService $media,
        private readonly SeoService $seo,
    ) {}

    public function handle(array $data): Article
    {
        $slug = trim($data['slug'] ?? '') !== ''
            ? $data['slug']
            : SlugGenerator::unique('articles', $data['title']);

        $featuredImage = match (true) {
            isset($data['featured_image']) && $data['featured_image'] !== null => $this->media->storePublicImage($data['featured_image'], 'articles'),
            ! empty($data['featured_image_path']) => $data['featured_image_path'],
            default => null,
        };

        return DB::transaction(function () use ($data, $slug, $featuredImage) {
            $article = Article::create([
                'news_category_id' => $data['news_category_id'] ?? null,
                'title' => $data['title'],
                'slug' => $slug,
                'excerpt' => $data['excerpt'] ?? null,
                'content' => $data['content'] ?? null,
                'featured_image' => $featuredImage,
                'author_id' => Auth::id(),
                'is_featured' => $data['is_featured'] ?? false,
                'status' => $data['status'],
                'published_at' => $data['published_at'] ?? null,
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ]);

            $this->seo->saveMetadata($article, $data['seo'] ?? [], $this->media, 'seo/news');

            $this->activityLog->record('article.created', $article, ['title' => $article->title]);

            return $article;
        });
    }
}
