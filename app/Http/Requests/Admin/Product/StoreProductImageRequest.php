<?php

namespace App\Http\Requests\Admin\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image' => ['nullable', 'required_without:media_path', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'media_path' => ['nullable', 'required_without:image', 'string', 'max:255', Rule::exists('media', 'path')],
            'alt_text' => ['nullable', 'string', 'max:255'],
        ];
    }
}
