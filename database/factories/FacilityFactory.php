<?php

namespace Database\Factories;

use App\Enums\ContentStatus;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class FacilityFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
            'location' => fake()->city(),
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
}
