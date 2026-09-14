<?php

namespace Database\Factories;

use App\Enums\SectionType;
use App\Models\Page;
use Illuminate\Database\Eloquent\Factories\Factory;

class PageSectionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'page_id' => Page::factory(),
            'section_type' => fake()->randomElement(SectionType::forGenericPage()),
            'title' => fake()->sentence(3),
            'subtitle' => fake()->sentence(),
            'content' => ['body' => fake()->paragraph()],
            'settings_json' => null,
            'sort_order' => 0,
            'is_active' => true,
        ];
    }
}
