<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SlugGenerator
{
    /**
     * Generate a URL-safe slug from $value, unique within $table.
     * Includes soft-deleted rows in the uniqueness check since the
     * database column itself is unique regardless of trashed state.
     */
    public static function unique(string $table, string $value, ?int $ignoreId = null, string $column = 'slug'): string
    {
        $base = Str::slug($value);
        $slug = $base !== '' ? $base : Str::random(8);
        $suffix = 1;

        while (
            DB::table($table)
                ->where($column, $slug)
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
