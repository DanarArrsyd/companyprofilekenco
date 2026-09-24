<?php

namespace App\Http\Requests\Admin\NewsCategory;

use App\Http\Requests\Concerns\ValidatesTranslations;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNewsCategoryRequest extends FormRequest
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
            'slug' => [
                'nullable', 'string', 'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('news_categories', 'slug'),
            ],
            'description' => ['nullable', 'string'],
        ];

        $rules = $this->withTranslations($rules, ['name', 'description']);

        return $rules;
    }
}
