<?php

namespace App\Models\Contracts;

/**
 * A model whose `content` array holds CMS text next to shared data. Text
 * values are a plain string (English only) or {"en": …, "id": …}; the paths
 * listed here are the ones auto-translate may fill.
 */
interface HasTranslatableContent
{
    /** @return list<string> Keys of `content`; `items.*.label` addresses a key inside each list item. */
    public function translatableContentPaths(): array;
}
