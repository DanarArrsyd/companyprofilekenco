<?php

namespace App\Actions\ContactInquiry;

use App\Models\ContactInquiry;

class SubmitContactInquiry
{
    public function handle(array $data): ContactInquiry
    {
        return ContactInquiry::create([
            'name' => $data['name'],
            'company' => $data['company'] ?? null,
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'subject' => $data['subject'] ?? null,
            'message' => $data['message'],
            'ip_address' => $data['ip_address'] ?? null,
            'user_agent' => $data['user_agent'] ?? null,
        ]);
    }
}
