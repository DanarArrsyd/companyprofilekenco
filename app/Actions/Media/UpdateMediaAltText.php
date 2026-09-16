<?php

namespace App\Actions\Media;

use App\Models\Media;

class UpdateMediaAltText
{
    public function handle(Media $media, ?string $altText): Media
    {
        $media->update(['alt_text' => $altText]);

        return $media->fresh();
    }
}
