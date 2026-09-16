<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class MilestoneFactory extends Factory
{
    public function definition(): array
    {
        return [
            'year' => fake()->numberBetween(2000, 2025),
            'title' => fake()->sentence(3),
            'description' => fake()->sentence(),
            'order' => 0,
        ];
    }
}
