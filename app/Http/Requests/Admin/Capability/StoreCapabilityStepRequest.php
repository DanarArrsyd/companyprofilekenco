<?php

namespace App\Http\Requests\Admin\Capability;

use Illuminate\Foundation\Http\FormRequest;

class StoreCapabilityStepRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ];
    }
}
