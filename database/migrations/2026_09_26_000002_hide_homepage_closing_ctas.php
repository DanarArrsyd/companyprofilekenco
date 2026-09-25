<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/*
 * The homepage now ends with Latest News followed by the footer (user
 * decision, 2026-09-25). The Career CTA and Contact CTA sections are switched
 * off, not deleted, so their text stays editable and they can be turned back
 * on from Admin → Homepage.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('page_sections')
            ->whereIn('page_id', DB::table('pages')->where('page_type', 'homepage')->select('id'))
            ->whereIn('section_type', ['career_cta', 'contact_cta'])
            ->update(['is_active' => false]);
    }

    public function down(): void
    {
        DB::table('page_sections')
            ->whereIn('page_id', DB::table('pages')->where('page_type', 'homepage')->select('id'))
            ->whereIn('section_type', ['career_cta', 'contact_cta'])
            ->update(['is_active' => true]);
    }
};
