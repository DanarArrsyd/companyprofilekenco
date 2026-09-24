<?php

namespace App\Http\Requests\Admin\Article;

use App\Enums\ContentStatus;
use App\Http\Requests\Concerns\ValidatesTranslations;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateArticleRequest extends FormRequest
{
    use ValidatesTranslations;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'news_category_id' => ['nullable', 'integer', Rule::exists('news_categories', 'id')],
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'featured_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'featured_image_path' => ['nullable', 'string', 'max:255'],
            'is_featured' => ['boolean'],
            'status' => ['required', new Enum(ContentStatus::class)],
            'published_at' => ['nullable', 'date'],

            'seo.meta_title' => ['nullable', 'string', 'max:70'],
            'seo.meta_description' => ['nullable', 'string', 'max:160'],
            'seo.canonical_url' => ['nullable', 'url', 'max:255'],
            'seo.og_title' => ['nullable', 'string', 'max:70'],
            'seo.og_description' => ['nullable', 'string', 'max:200'],
            'seo.og_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'seo.og_image_path' => ['nullable', 'string', 'max:255'],
            'seo.robots_index' => ['boolean'],
            'seo.robots_follow' => ['boolean'],
        ];

        $rules = $this->withTranslations($rules, ['title', 'excerpt', 'content']);

        return $this->withTranslations($rules, ['meta_title', 'meta_description', 'og_title', 'og_description'], 'seo.');
    }
}
