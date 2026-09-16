<?php

namespace Database\Factories;

use App\Enums\ContentStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

class CertificationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => 'ISO '.fake()->numberBetween(9000, 9999).':'.fake()->numberBetween(2010, 2020),
            'issuer' => fake()->company(),
            'certificate_number' => strtoupper(fake()->bothify('CERT-####-????')),
            'issued_at' => fake()->dateTimeBetween('-3 years', '-1 year'),
            'expires_at' => fake()->dateTimeBetween('+1 year', '+3 years'),
            'sort_order' => 0,
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

    public function expired(): static
    {
        return $this->state(fn () => [
            'issued_at' => now()->subYears(5),
            'expires_at' => now()->subYear(),
        ]);
    }
}
