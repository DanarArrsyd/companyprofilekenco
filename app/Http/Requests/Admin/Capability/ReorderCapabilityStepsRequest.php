<?php

namespace App\Http\Requests\Admin\Capability;

use Illuminate\Foundation\Http\FormRequest;

class ReorderCapabilityStepsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ordered_ids' => ['required', 'array', 'min:1'],
            'ordered_ids.*' => ['integer', 'distinct'],
        ];
    }
}
