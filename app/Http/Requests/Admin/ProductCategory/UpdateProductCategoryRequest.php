<?php

namespace App\Http\Requests\Admin\ProductCategory;

use App\Enums\ContentStatus;
use App\Http\Requests\Concerns\ValidatesTranslations;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateProductCategoryRequest extends FormRequest
{
    use ValidatesTranslations;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', new Enum(ContentStatus::class)],
        ];

        $rules = $this->withTranslations($rules, ['name', 'description']);

        return $rules;
    }
}
