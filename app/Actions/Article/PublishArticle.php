<?php

namespace App\Actions\Article;

use App\Enums\ContentStatus;
use App\Models\Article;
use App\Services\ActivityLogService;
use Illuminate\Support\Facades\Auth;

class PublishArticle
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(Article $article): Article
    {
        $article->update([
            'status' => ContentStatus::Published,
            'published_at' => $article->published_at ?? now(),
            'updated_by' => Auth::id(),
        ]);

        $this->activityLog->record('article.published', $article, ['title' => $article->title]);

        return $article->fresh();
    }
}
