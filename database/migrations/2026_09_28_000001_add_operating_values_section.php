<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/*
 * Adds the "Operating Values" (K.E.N.C.O) section under Vision & Mission on
 * the Company page (user reference, 2026-09-28). Content is ordinary CMS
 * section content, editable in Admin → Pages → Vision & Mission. Value titles
 * stay English in both languages because their first letters spell KENCO.
 * Skipped when the page is missing or already has the section.
 */
return new class extends Migration
{
    public function up(): void
    {
        $page = DB::table('pages')->where('slug', 'company/vision-mission')->first();

        if (! $page || DB::table('page_sections')->where('page_id', $page->id)->where('section_type', 'operating_values')->exists()) {
            return;
        }

        $text = fn (string $en, string $id) => ['en' => $en, 'id' => $id];

        DB::table('page_sections')->insert([
            'page_id' => $page->id,
            'section_type' => 'operating_values',
            'title' => json_encode(['en' => 'Operating Values', 'id' => 'Nilai Operasional']),
            'subtitle' => null,
            'content' => json_encode([
                'heading' => $text('Operating Values', 'Nilai Operasional'),
                'description' => $text(
                    'The operating values that shape how we work, make decisions, innovate and drive continuous improvement.',
                    'Nilai-nilai operasional yang menjadi landasan dalam membentuk cara kami bekerja, mengambil keputusan, berinovasi, dan mendorong perbaikan berkelanjutan.',
                ),
                'eyebrow' => 'What is??',
                'items' => [
                    ['letter' => 'K', 'title' => 'Keep Safety First', 'icon' => null, 'description' => $text(
                        'Putting safety first in every activity by building a safe, disciplined and responsible workplace.',
                        'Menempatkan keselamatan sebagai prioritas utama dalam setiap aktivitas kerja dengan membangun lingkungan kerja yang aman, disiplin, dan bertanggung jawab.',
                    )],
                    ['letter' => 'E', 'title' => 'Eliminate Waste', 'icon' => null, 'description' => $text(
                        'Committed to reducing waste in every process through effective, efficient and sustainable use of resources.',
                        'Berkomitmen untuk mengurangi pemborosan dalam setiap proses melalui penggunaan sumber daya yang efektif, efisien, dan berkelanjutan.',
                    )],
                    ['letter' => 'N', 'title' => 'Never Pass Defect', 'icon' => null, 'description' => $text(
                        'Protecting quality at every stage: we do not make, accept or pass on products that fail to meet the standard.',
                        'Menjaga kualitas di setiap tahapan proses dengan prinsip tidak membuat, tidak menerima, dan tidak meneruskan produk yang tidak sesuai standar.',
                    )],
                    ['letter' => 'C', 'title' => 'Continuous Improvement', 'icon' => null, 'description' => $text(
                        'Building a culture of continuous improvement through evaluation, innovation and process refinement that raise quality and productivity.',
                        'Mendorong budaya perbaikan berkelanjutan melalui evaluasi, inovasi, dan penyempurnaan proses untuk meningkatkan kualitas serta produktivitas.',
                    )],
                    ['letter' => 'O', 'title' => 'Ownership', 'icon' => null, 'description' => $text(
                        'Fostering a sense of ownership and responsibility for our work, its results, our workplace and the goals we share.',
                        'Menumbuhkan rasa memiliki dan tanggung jawab terhadap pekerjaan, hasil, lingkungan kerja, serta pencapaian tujuan bersama.',
                    )],
                ],
            ]),
            'settings_json' => null,
            'sort_order' => (int) DB::table('page_sections')->where('page_id', $page->id)->max('sort_order') + 1,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        $pageId = DB::table('pages')->where('slug', 'company/vision-mission')->value('id');

        DB::table('page_sections')->where('page_id', $pageId)->where('section_type', 'operating_values')->delete();
    }
};
