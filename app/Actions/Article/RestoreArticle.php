<?php

namespace App\Actions\Article;

use App\Models\Article;

class RestoreArticle
{
    public function handle(Article $article): Article
    {
        $article->restore();

        return $article->fresh();
    }
}
