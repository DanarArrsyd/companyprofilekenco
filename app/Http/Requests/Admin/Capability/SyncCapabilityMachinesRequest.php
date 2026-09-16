<?php

namespace App\Http\Requests\Admin\Capability;

use Illuminate\Foundation\Http\FormRequest;

class SyncCapabilityMachinesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'machine_ids' => ['array'],
            'machine_ids.*' => ['integer', 'exists:machines,id'],
        ];
    }
}
