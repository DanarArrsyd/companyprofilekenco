<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'job_vacancy_id',
    'applicant_name',
    'applicant_email',
    'applicant_phone',
    'cover_letter',
    'cv_path',
    'status',
])]
class JobApplication extends Model
{
    public function jobVacancy(): BelongsTo
    {
        return $this->belongsTo(JobVacancy::class);
    }
}
