<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SeoMetadataFactory extends Factory
{
    public function definition(): array
    {
        return [
            'meta_title' => fake()->sentence(),
            'meta_description' => fake()->text(150),
            'canonical_url' => fake()->url(),
            'og_title' => fake()->sentence(),
            'og_description' => fake()->text(150),
            'og_image' => null,
            'robots_index' => true,
            'robots_follow' => true,
            'schema_json' => null,
        ];
    }
}
