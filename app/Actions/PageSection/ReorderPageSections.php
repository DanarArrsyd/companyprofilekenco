<?php

namespace App\Actions\PageSection;

use App\Models\Page;
use Illuminate\Support\Facades\DB;

class ReorderPageSections
{
    /**
     * @param  array<int, int>  $orderedIds  Section IDs in their new display order.
     */
    public function handle(Page $page, array $orderedIds): void
    {
        DB::transaction(function () use ($page, $orderedIds) {
            foreach ($orderedIds as $index => $sectionId) {
                $page->sections()->whereKey($sectionId)->update(['sort_order' => $index]);
            }
        });
    }
}
