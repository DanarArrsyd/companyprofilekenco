<?php

namespace App\Http\Requests\Admin\Capability;

use App\Http\Requests\Concerns\ValidatesTranslations;
use Illuminate\Foundation\Http\FormRequest;

class StoreCapabilityStepRequest extends FormRequest
{
    use ValidatesTranslations;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ];

        $rules = $this->withTranslations($rules, ['title', 'description']);

        return $rules;
    }
}
