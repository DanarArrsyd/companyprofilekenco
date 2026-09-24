<?php

namespace App\Http\Requests\Admin\PageSection;

use App\Enums\SectionType;
use App\Http\Requests\Concerns\ValidatesTranslations;
use App\Rules\RelativeOrAbsoluteUrl;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StorePageSectionRequest extends FormRequest
{
    use ValidatesTranslations;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'section_type' => ['required', new Enum(SectionType::class)],
            'title' => ['nullable', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'array'],
            'content.primary_cta_url' => ['nullable', 'string', 'max:255', new RelativeOrAbsoluteUrl],
            'content.secondary_cta_url' => ['nullable', 'string', 'max:255', new RelativeOrAbsoluteUrl],
            'content.cta_url' => ['nullable', 'string', 'max:255', new RelativeOrAbsoluteUrl],
            'settings_json' => ['nullable', 'array'],
            'is_active' => ['boolean'],
        ];

        $rules = $this->withTranslations($rules, ['title', 'subtitle']);

        return $rules;
    }
}
