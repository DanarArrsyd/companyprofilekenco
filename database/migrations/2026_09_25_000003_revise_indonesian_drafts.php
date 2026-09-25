<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Review pass over the Indonesian drafts from
 * 2026_09_25_000002_add_indonesian_drafts_for_existing_content.
 *
 * Brand voice decision: manufacturing jargon and job titles stay English on
 * the Indonesian site, as in the company's own copy ("bergerak di bidang
 * manufaktur dan metal stamping"); generic activities and descriptions stay
 * Indonesian. Also fixes a few awkward drafts.
 *
 * A value changes only while its English is the known source AND its
 * Indonesian is still exactly the old draft, so admin edits are never
 * overwritten. down() reverts only values still equal to the revision.
 */
return new class extends Migration
{
    /** @var array<string, list<string>> */
    private const COLUMNS = [
        'articles' => ['title', 'excerpt', 'content'],
        'capabilities' => ['name', 'summary', 'description'],
        'capability_steps' => ['title', 'description'],
        'facilities' => ['name', 'description'],
        'facility_categories' => ['name', 'description'],
        'industries' => ['name', 'description'],
        'job_vacancies' => ['title', 'description', 'requirements'],
        'milestones' => ['title', 'description'],
        'news_categories' => ['name', 'description'],
        'pages' => ['title'],
        'page_sections' => ['title', 'subtitle'],
        'products' => ['short_description', 'description', 'material', 'application', 'manufacturing_process'],
        'product_categories' => ['name', 'description'],
        'quality_contents' => ['title', 'summary', 'content'],
        'statistics' => ['label'],
    ];

    /** English source => [old Indonesian draft, revised Indonesian]. */
    private const REVISIONS = [
        // Jargon stays English
        'Metal Stamping' => ['Stamping Logam', 'Metal Stamping'],
        'CNC Machining' => ['Permesinan CNC', 'CNC Machining'],
        'Assembly & Testing' => ['Perakitan & Pengujian', 'Assembly & Testing'],
        'Tool & Die Design' => ['Desain Tool & Die', 'Tool & Die Design'],
        'Progressive Die Stamping' => ['Stamping Progressive Die', 'Progressive Die Stamping'],
        'CAM Programming' => ['Pemrograman CAM', 'CAM Programming'],
        'Multi-Axis Machining' => ['Permesinan Multi-Sumbu', 'Multi-Axis Machining'],
        'Sub-Assembly' => ['Sub-Perakitan', 'Sub-Assembly'],
        'Multi-axis CNC machining for tight-tolerance metal and plastic parts.' => [
            'Permesinan CNC multi-sumbu untuk komponen logam dan plastik bertoleransi ketat.',
            'CNC machining multi-axis untuk komponen logam dan plastik dengan toleransi ketat.',
        ],
        'Multi-axis CNC centers machine metal and plastic parts to tight tolerances, programmed directly from customer CAD data and verified on CMM equipment.' => [
            'Pusat permesinan CNC multi-sumbu memproses komponen logam dan plastik dengan toleransi ketat, diprogram langsung dari data CAD pelanggan dan diverifikasi dengan peralatan CMM.',
            'Mesin CNC multi-axis kami memproses komponen logam dan plastik dengan toleransi ketat, diprogram langsung dari data CAD pelanggan dan diverifikasi dengan CMM.',
        ],
        'Sub-assembly, functional testing, and final packaging.' => [
            'Sub-perakitan, pengujian fungsional, dan pengemasan akhir.',
            'Sub-assembly, pengujian fungsional, dan pengemasan akhir.',
        ],
        'We combine components into finished sub-assemblies, run functional testing against customer specifications, and package for direct shipment to the production line.' => [
            'Kami merakit komponen menjadi sub-perakitan jadi, melakukan pengujian fungsional sesuai spesifikasi pelanggan, dan mengemasnya untuk dikirim langsung ke lini produksi.',
            'Kami merakit komponen menjadi sub-assembly siap pakai, melakukan pengujian fungsional sesuai spesifikasi pelanggan, dan mengemasnya untuk dikirim langsung ke lini produksi.',
        ],

        // Job titles stay English
        'Production Intern' => ['Magang Produksi', 'Production Intern'],
        'Manufacturing Engineer' => ['Insinyur Manufaktur', 'Manufacturing Engineer'],
        'Quality Control Inspector' => ['Inspektur Quality Control', 'Quality Control Inspector'],
        'We are looking for a Production Intern to join our Production team in Karawang.' => [
            'Kami mencari Magang Produksi untuk bergabung dengan tim Produksi kami di Karawang.',
            'Kami mencari Production Intern untuk bergabung dengan tim Produksi kami di Karawang.',
        ],
        'We are looking for a Manufacturing Engineer to join our Engineering team in Karawang.' => [
            'Kami mencari Insinyur Manufaktur untuk bergabung dengan tim Engineering kami di Karawang.',
            'Kami mencari Manufacturing Engineer untuk bergabung dengan tim Engineering kami di Karawang.',
        ],
        'We are looking for a Quality Control Inspector to join our Quality Assurance team in Karawang.' => [
            'Kami mencari Inspektur Quality Control untuk bergabung dengan tim Quality Assurance kami di Karawang.',
            'Kami mencari Quality Control Inspector untuk bergabung dengan tim Quality Assurance kami di Karawang.',
        ],

        // Wording fixes
        'Engineered for Reliability' => ['Direkayasa untuk Keandalan', 'Dirancang untuk Keandalan'],
        'Where We Manufacture' => ['Tempat Kami Berproduksi', 'Lokasi Produksi Kami'],
        'Join Our Team' => ['Bergabung dengan Tim Kami', 'Bergabunglah dengan Tim Kami'],
        'Consumer Goods' => ['Barang Konsumen', 'Barang Konsumsi'],
        'Enclosures and structural parts for consumer and industrial electronics.' => [
            'Rumah perangkat dan komponen struktural untuk elektronik konsumen dan industri.',
            'Casing dan komponen struktural untuk elektronik konsumen dan industri.',
        ],
        'Stamped Metal Components' => ['Komponen Logam Stamping', 'Komponen Logam Hasil Stamping'],
        'Molded Plastic Parts' => ['Komponen Plastik Cetak', 'Komponen Plastik Hasil Molding'],
    ];

    public function up(): void
    {
        $this->apply(fn (string $english, string $indonesian) => (self::REVISIONS[$english][0] ?? null) === $indonesian
            ? self::REVISIONS[$english][1]
            : null);
    }

    public function down(): void
    {
        $this->apply(fn (string $english, string $indonesian) => (self::REVISIONS[$english][1] ?? null) === $indonesian
            ? self::REVISIONS[$english][0]
            : null);
    }

    /** @param  callable(string, string): ?string  $revise  Returns the new Indonesian text, or null to leave it. */
    private function apply(callable $revise): void
    {
        $reviseMap = function (array $map) use ($revise): ?array {
            if (! is_string($map['en'] ?? null) || ! is_string($map['id'] ?? null)) {
                return null;
            }

            $next = $revise($map['en'], $map['id']);

            return $next === null ? null : ['en' => $map['en'], 'id' => $next];
        };

        foreach (self::COLUMNS as $table => $columns) {
            DB::table($table)->orderBy('id')->chunkById(200, function ($rows) use ($table, $columns, $reviseMap) {
                foreach ($rows as $row) {
                    $changes = [];

                    foreach ($columns as $column) {
                        $map = json_decode((string) ($row->{$column} ?? ''), true);

                        if (is_array($map) && $this->isLocaleMap($map) && ($next = $reviseMap($map)) !== null) {
                            $changes[$column] = $this->encode($next);
                        }
                    }

                    if ($changes !== []) {
                        DB::table($table)->where('id', $row->id)->update($changes);
                    }
                }
            });
        }

        DB::table('page_sections')->whereNotNull('content')->orderBy('id')->chunkById(200, function ($rows) use ($reviseMap) {
            foreach ($rows as $row) {
                $content = json_decode((string) $row->content, true);

                if (! is_array($content)) {
                    continue;
                }

                $next = $this->walk($content, $reviseMap);

                if ($next !== $content) {
                    DB::table('page_sections')->where('id', $row->id)->update(['content' => $this->encode($next)]);
                }
            }
        });
    }

    private function walk(mixed $value, callable $reviseMap): mixed
    {
        if (! is_array($value)) {
            return $value;
        }

        if ($this->isLocaleMap($value)) {
            return $reviseMap($value) ?? $value;
        }

        return array_map(fn ($item) => $this->walk($item, $reviseMap), $value);
    }

    private function isLocaleMap(array $value): bool
    {
        return $value !== [] && ! array_is_list($value) && array_diff(array_keys($value), ['en', 'id']) === [];
    }

    private function encode(array $value): string
    {
        return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
};
