<?php

namespace App\Models;

use App\Enums\InquiryStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'company', 'email', 'phone', 'subject', 'message', 'status', 'ip_address', 'user_agent'])]
class ContactInquiry extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'status' => InquiryStatus::class,
        ];
    }
}
