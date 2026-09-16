<?php

namespace App\Actions\JobVacancy;

use App\Models\JobVacancy;

class RestoreJobVacancy
{
    public function handle(JobVacancy $vacancy): JobVacancy
    {
        $vacancy->restore();

        return $vacancy->fresh();
    }
}
