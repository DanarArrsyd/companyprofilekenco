<?php

namespace App\Actions\Article;

use App\Models\Article;
use App\Services\ActivityLogService;

class DeleteArticle
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(Article $article): void
    {
        $article->delete();

        $this->activityLog->record('article.deleted', $article, ['title' => $article->title]);
    }
}
