<?php

namespace Database\Factories;

use App\Enums\ContentStatus;
use App\Models\ProductCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'product_category_id' => ProductCategory::factory(),
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
            'short_description' => fake()->sentence(),
            'description' => fake()->paragraph(),
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
