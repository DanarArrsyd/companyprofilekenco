<?php

namespace App\Actions\ContactInquiry;

use App\Models\ContactInquiry;
use App\Services\ActivityLogService;

class UpdateInquiryStatus
{
    public function __construct(
        private readonly ActivityLogService $activityLog,
    ) {}

    public function handle(ContactInquiry $inquiry, string $status): ContactInquiry
    {
        $inquiry->update(['status' => $status]);

        $this->activityLog->record('contact_inquiry.status_updated', $inquiry, [
            'sender' => $inquiry->name,
            'status' => $inquiry->status->value,
        ]);

        return $inquiry->fresh();
    }
}
