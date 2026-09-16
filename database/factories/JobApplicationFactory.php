<?php

namespace Database\Factories;

use App\Enums\ApplicationStatus;
use App\Models\JobVacancy;
use Illuminate\Database\Eloquent\Factories\Factory;

class JobApplicationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'job_vacancy_id' => JobVacancy::factory(),
            'applicant_name' => fake()->name(),
            'applicant_email' => fake()->unique()->safeEmail(),
            'applicant_phone' => fake()->phoneNumber(),
            'applicant_address' => fake()->address(),
            'cover_letter' => fake()->paragraph(),
            'cv_path' => 'cvs/'.fake()->uuid().'.pdf',
            'status' => ApplicationStatus::New,
        ];
    }
}
