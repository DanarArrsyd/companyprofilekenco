<?php

namespace App\Actions\JobVacancy;

use App\Models\JobVacancy;

class DeleteJobVacancy
{
    public function handle(JobVacancy $vacancy): void
    {
        $vacancy->delete();
    }
}
