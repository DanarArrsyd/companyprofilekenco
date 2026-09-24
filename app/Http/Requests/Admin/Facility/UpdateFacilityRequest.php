<?php

namespace App\Http\Requests\Admin\Facility;

use App\Enums\ContentStatus;
use App\Http\Requests\Concerns\ValidatesTranslations;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateFacilityRequest extends FormRequest
{
    use ValidatesTranslations;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'facility_category_id' => ['nullable', 'integer', Rule::exists('facility_categories', 'id')],
            'name' => ['required', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'image_path' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', new Enum(ContentStatus::class)],
            'published_at' => ['nullable', 'date'],
        ];

        $rules = $this->withTranslations($rules, ['name', 'description']);

        return $rules;
    }
}
