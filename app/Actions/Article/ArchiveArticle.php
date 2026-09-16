<?php

namespace App\Actions\Article;

use App\Enums\ContentStatus;
use App\Models\Article;
use App\Services\ActivityLogService;
use Illuminate\Support\Facades\Auth;

class ArchiveArticle
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(Article $article): Article
    {
        $article->update([
            'status' => ContentStatus::Archived,
            'updated_by' => Auth::id(),
        ]);

        $this->activityLog->record('article.archived', $article, ['title' => $article->title]);

        return $article->fresh();
    }
}
