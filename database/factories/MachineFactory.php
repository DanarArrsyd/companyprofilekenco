<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class MachineFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'model_number' => strtoupper(fake()->bothify('MX-####')),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
