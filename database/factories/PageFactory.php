<?php

namespace Database\Factories;

use App\Enums\ContentStatus;
use App\Enums\PageType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PageFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->unique()->words(3, true);

        return [
            'title' => ucfirst($title),
            'slug' => Str::slug($title),
            'page_type' => PageType::Standard,
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
