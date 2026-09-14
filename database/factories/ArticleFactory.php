<?php

namespace Database\Factories;

use App\Enums\ContentStatus;
use App\Models\NewsCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ArticleFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->unique()->sentence(4);

        return [
            'news_category_id' => NewsCategory::factory(),
            'title' => $title,
            'slug' => Str::slug($title),
            'excerpt' => fake()->sentence(),
            'body' => fake()->paragraphs(3, true),
            'status' => ContentStatus::Draft,
            'published_at' => null,
        ];
    }

    public function published(): static
    {
        return $this->state(fn () => [
            'status' => ContentStatus::Published,
            'published_at' => now()->subDay(),
        ]);
    }

    public function archived(): static
    {
        return $this->state(fn () => [
            'status' => ContentStatus::Archived,
            'published_at' => now()->subMonth(),
        ]);
    }
}
