<?php

namespace App\Http\Requests\Admin\PageSection;

use App\Enums\SectionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdatePageSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'section_type' => ['required', new Enum(SectionType::class)],
            'title' => ['nullable', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'array'],
            'content.primary_cta_url' => ['nullable', 'url', 'max:255'],
            'content.secondary_cta_url' => ['nullable', 'url', 'max:255'],
            'content.cta_url' => ['nullable', 'url', 'max:255'],
            'settings_json' => ['nullable', 'array'],
            'is_active' => ['boolean'],
        ];
    }
}
