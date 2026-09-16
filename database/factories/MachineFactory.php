<?php

namespace Database\Factories;

use App\Enums\ContentStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

class MachineFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'brand' => fake()->company(),
            'model' => strtoupper(fake()->bothify('MX-####')),
            'quantity' => fake()->numberBetween(1, 5),
            'capacity' => fake()->numberBetween(1, 100).' ton',
            'description' => fake()->sentence(),
            'specification' => fake()->sentence(),
            'sort_order' => 0,
            'status' => ContentStatus::Published,
            'is_active' => true,
        ];
    }
}
