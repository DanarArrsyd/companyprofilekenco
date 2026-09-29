<?php

namespace App\Http\Requests\Admin\Customer;

use Illuminate\Foundation\Http\FormRequest;

/** A customer shown in "Customers Served" on the homepage: a name and a logo. */
class SaveCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'logo_path' => ['nullable', 'string', 'max:255'],
            'is_featured' => ['boolean'],
        ];
    }
}
