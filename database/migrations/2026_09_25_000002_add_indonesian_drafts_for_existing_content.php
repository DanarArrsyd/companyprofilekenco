<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Indonesian drafts for the CMS content that existed when the site became
 * bilingual (crawled from staging on 2026-09-25), for the admin to review.
 *
 * Matching is by exact text, never by row ID:
 * - DRAFTS fills `id` only where the stored English is exactly the source
 *   and no Indonesian translation exists yet, so edited or already
 *   translated content is never overwritten.
 * - A few values were authored in Indonesian and got wrapped as `en` by the
 *   previous migration; ENGLISH_FOR_INDONESIAN moves them to `id` and puts
 *   the English version in `en`.
 *
 * Brand, legal and certification names are not translated. down() only
 * removes drafts that are still exactly as written here.
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

    private const ARTICLE_CLOSING_EN = 'Our team continues to invest in process discipline and equipment to serve our customers reliably.';

    private const ARTICLE_CLOSING_ID = 'Tim kami terus berinvestasi dalam disiplin proses dan peralatan untuk melayani pelanggan secara andal.';

    /** English source => Indonesian draft. */
    private const DRAFTS = [
        // Homepage
        'Precision Manufacturing, Built to Last' => 'Manufaktur Presisi, Dibuat untuk Bertahan Lama',
        'Our Capabilities' => 'Kapabilitas Kami',
        'Contact Us' => 'Hubungi Kami',
        'Engineered for Reliability' => 'Direkayasa untuk Keandalan',
        'From tool design through final assembly, every part we produce is built to print and backed by full dimensional traceability — the same discipline our automotive and industrial customers rely on.' => 'Mulai dari desain perkakas hingga perakitan akhir, setiap komponen yang kami produksi dibuat sesuai gambar teknik dan didukung ketertelusuran dimensi yang lengkap — disiplin yang sama yang diandalkan pelanggan otomotif dan industri kami.',
        'Years in Operation' => 'Tahun Beroperasi',
        'Employees' => 'Karyawan',
        'Production Facilities' => 'Fasilitas Produksi',
        'On-Time Delivery' => 'Pengiriman Tepat Waktu',
        'What We Do' => 'Apa yang Kami Kerjakan',
        'Manufacturing Capabilities' => 'Kapabilitas Manufaktur',
        'Featured Products' => 'Produk Unggulan',
        'Where We Manufacture' => 'Tempat Kami Berproduksi',
        'Quality You Can Verify' => 'Mutu yang Dapat Dibuktikan',
        'Every facility operates under ISO 9001 and IATF 16949, with in-line inspection on every production run.' => 'Setiap fasilitas beroperasi berdasarkan ISO 9001 dan IATF 16949, dengan inspeksi in-line pada setiap proses produksi.',
        'Join Our Team' => 'Bergabung dengan Tim Kami',
        'View Openings' => 'Lihat Lowongan',
        "Let's discuss your next production run" => 'Mari diskusikan kebutuhan produksi Anda berikutnya',
        'Let’s discuss your next production run' => 'Mari diskusikan kebutuhan produksi Anda berikutnya',

        // Capabilities
        'Metal Stamping' => 'Stamping Logam',
        'CNC Machining' => 'Permesinan CNC',
        'Assembly & Testing' => 'Perakitan & Pengujian',
        'High-volume progressive die stamping for precision metal components.' => 'Stamping progressive die volume tinggi untuk komponen logam presisi.',
        'Multi-axis CNC machining for tight-tolerance metal and plastic parts.' => 'Permesinan CNC multi-sumbu untuk komponen logam dan plastik bertoleransi ketat.',
        'Sub-assembly, functional testing, and final packaging.' => 'Sub-perakitan, pengujian fungsional, dan pengemasan akhir.',
        'Our stamping lines run progressive dies for high-volume metal components, from prototype tooling through full production, with in-line dimensional checks on every run.' => 'Lini stamping kami menjalankan progressive die untuk komponen logam volume tinggi, mulai dari tooling prototipe hingga produksi penuh, dengan pemeriksaan dimensi in-line pada setiap proses.',
        'Multi-axis CNC centers machine metal and plastic parts to tight tolerances, programmed directly from customer CAD data and verified on CMM equipment.' => 'Pusat permesinan CNC multi-sumbu memproses komponen logam dan plastik dengan toleransi ketat, diprogram langsung dari data CAD pelanggan dan diverifikasi dengan peralatan CMM.',
        'We combine components into finished sub-assemblies, run functional testing against customer specifications, and package for direct shipment to the production line.' => 'Kami merakit komponen menjadi sub-perakitan jadi, melakukan pengujian fungsional sesuai spesifikasi pelanggan, dan mengemasnya untuk dikirim langsung ke lini produksi.',
        'Tool & Die Design' => 'Desain Tool & Die',
        'Progressive Die Stamping' => 'Stamping Progressive Die',
        'In-line Quality Inspection' => 'Inspeksi Mutu In-line',
        'CAM Programming' => 'Pemrograman CAM',
        'Multi-Axis Machining' => 'Permesinan Multi-Sumbu',
        'Dimensional Inspection' => 'Inspeksi Dimensi',
        'Sub-Assembly' => 'Sub-Perakitan',
        'Functional Testing' => 'Pengujian Fungsional',
        'Packaging & Kitting' => 'Pengemasan & Kitting',

        // Facilities
        'Plant 1 - Manufacturing Operations Center' => 'Pabrik 1 - Pusat Operasional Manufaktur',
        'Manufacturing Plant' => 'Pabrik Manufaktur',
        'A production facility operating under ISO 9001 and IATF 16949 quality management systems.' => 'Fasilitas produksi yang beroperasi berdasarkan sistem manajemen mutu ISO 9001 dan IATF 16949.',

        // Industries
        'Automotive' => 'Otomotif',
        'Electronics' => 'Elektronik',
        'Aerospace' => 'Kedirgantaraan',
        'Industrial Equipment' => 'Peralatan Industri',
        'Consumer Goods' => 'Barang Konsumen',
        'Precision components for tier-1 and tier-2 automotive suppliers.' => 'Komponen presisi untuk pemasok otomotif tier-1 dan tier-2.',
        'Enclosures and structural parts for consumer and industrial electronics.' => 'Rumah perangkat dan komponen struktural untuk elektronik konsumen dan industri.',
        'Tight-tolerance machined parts for aerospace subassemblies.' => 'Komponen hasil permesinan bertoleransi ketat untuk sub-perakitan kedirgantaraan.',
        'Structural and mechanical components for heavy machinery OEMs.' => 'Komponen struktural dan mekanis untuk OEM alat berat.',
        'High-volume plastic and metal parts for consumer product brands.' => 'Komponen plastik dan logam volume tinggi untuk merek produk konsumen.',

        // Milestones
        'Company Founded' => 'Perusahaan Didirikan',
        'Started operations as a precision metal stamping supplier.' => 'Memulai operasi sebagai pemasok metal stamping presisi.',
        'ISO 9001 Certified' => 'Tersertifikasi ISO 9001',
        'Achieved our first quality management certification.' => 'Meraih sertifikasi manajemen mutu pertama kami.',
        'Plant 2 Opened' => 'Pabrik 2 Dibuka',
        'Expanded into injection molding with a second production facility.' => 'Berekspansi ke injection molding dengan fasilitas produksi kedua.',
        'Automation Upgrade' => 'Peningkatan Otomasi',
        'Introduced automated inspection across all production lines.' => 'Menerapkan inspeksi otomatis di seluruh lini produksi.',
        'IATF 16949 Certified' => 'Tersertifikasi IATF 16949',
        'Certified to the automotive industry quality standard.' => 'Tersertifikasi sesuai standar mutu industri otomotif.',

        // News
        'Kenco Manufactur Achieves IATF 16949 Certification' => 'Kenco Manufactur Meraih Sertifikasi IATF 16949',
        'Our quality management system is now certified to the automotive industry standard.' => 'Sistem manajemen mutu kami kini tersertifikasi sesuai standar industri otomotif.',
        'New Injection Molding Line Now Operational' => 'Lini Injection Molding Baru Kini Beroperasi',
        'Plant 2 has added a new production line to support growing customer demand.' => 'Pabrik 2 menambah lini produksi baru untuk mendukung permintaan pelanggan yang terus meningkat.',
        'Expanding Our Automotive Supply Partnerships' => 'Memperluas Kemitraan Pasokan Otomotif Kami',
        'We are pleased to announce new partnerships with tier-1 automotive suppliers.' => 'Kami dengan bangga mengumumkan kemitraan baru dengan pemasok otomotif tier-1.',
        'How We Reduced Defect Rates Through Automation' => 'Cara Kami Menurunkan Tingkat Cacat melalui Otomasi',
        'A look at the automated inspection systems now running across our production lines.' => 'Melihat lebih dekat sistem inspeksi otomatis yang kini berjalan di seluruh lini produksi kami.',
        'Kenco Manufactur Joins Regional Manufacturing Association' => 'Kenco Manufactur Bergabung dengan Asosiasi Manufaktur Regional',
        'Strengthening our connections within the regional manufacturing community.' => 'Memperkuat hubungan kami dengan komunitas manufaktur regional.',
        'Year in Review: Production Milestones' => 'Kilas Balik Tahun Ini: Pencapaian Produksi',
        'A look back at the production milestones reached this year.' => 'Menengok kembali pencapaian produksi yang diraih tahun ini.',
        'Company News' => 'Berita Perusahaan',
        'Product Updates' => 'Kabar Produk',
        'Industry Insights' => 'Wawasan Industri',

        // Careers
        'Production Intern' => 'Magang Produksi',
        'Manufacturing Engineer' => 'Insinyur Manufaktur',
        'Quality Control Inspector' => 'Inspektur Quality Control',
        'CNC Machine Operator' => 'Operator Mesin CNC',
        'We are looking for a Production Intern to join our Production team in Karawang.' => 'Kami mencari Magang Produksi untuk bergabung dengan tim Produksi kami di Karawang.',
        'We are looking for a Manufacturing Engineer to join our Engineering team in Karawang.' => 'Kami mencari Insinyur Manufaktur untuk bergabung dengan tim Engineering kami di Karawang.',
        'We are looking for a Quality Control Inspector to join our Quality Assurance team in Karawang.' => 'Kami mencari Inspektur Quality Control untuk bergabung dengan tim Quality Assurance kami di Karawang.',
        'We are looking for a CNC Machine Operator to join our Production team in Karawang.' => 'Kami mencari Operator Mesin CNC untuk bergabung dengan tim Produksi kami di Karawang.',
        'Relevant experience in a manufacturing environment, strong attention to detail, and willingness to work in a production setting.' => 'Memiliki pengalaman relevan di lingkungan manufaktur, teliti, dan bersedia bekerja di lingkungan produksi.',

        // Company page
        'Company' => 'Perusahaan',
        'Who We Are' => 'Siapa Kami',
        'PT. Kenco Manufactur Indonesia is a precision manufacturing partner serving automotive, electronics, and industrial customers. We combine metal stamping, injection molding, and CNC machining under one roof to deliver components on schedule and to print.' => 'PT. Kenco Manufactur Indonesia adalah mitra manufaktur presisi yang melayani pelanggan otomotif, elektronik, dan industri. Kami memadukan metal stamping, injection molding, dan permesinan CNC dalam satu atap untuk menghasilkan komponen tepat waktu dan sesuai gambar teknik.',
        'By the Numbers' => 'Dalam Angka',
        'Founded' => 'Didirikan',
        'Facilities' => 'Fasilitas',
        'Customer Served' => 'Pelanggan Terlayani',
        'Vision & Mission' => 'Visi & Misi',
        'Vision' => 'Visi',
        'Mission' => 'Misi',
        'To be the most trusted precision manufacturing partner for automotive and industrial customers in Southeast Asia.' => 'Menjadi mitra manufaktur presisi paling tepercaya bagi pelanggan otomotif dan industri di Asia Tenggara.',
        'We deliver zero-defect components on time, every time, through disciplined process control, continuous improvement, and investment in our people.' => 'Kami menghasilkan komponen tanpa cacat, tepat waktu, setiap saat, melalui kontrol proses yang disiplin, perbaikan berkelanjutan, dan investasi pada sumber daya manusia kami.',

        // Products
        'Molded Plastic Parts' => 'Komponen Plastik Cetak',
        'Stamped Metal Components' => 'Komponen Logam Stamping',

        // Quality
        'Quality Policy' => 'Kebijakan Mutu',
        'Our commitment to zero-defect manufacturing at every stage.' => 'Komitmen kami terhadap manufaktur tanpa cacat di setiap tahap.',
        'Every product that leaves our facilities is manufactured under documented process controls, with quality built in at each station rather than inspected in at the end.' => 'Setiap produk yang keluar dari fasilitas kami diproduksi berdasarkan kontrol proses yang terdokumentasi, dengan mutu yang dibangun di setiap stasiun kerja, bukan sekadar diperiksa di akhir.',
        'Inspection Process' => 'Proses Inspeksi',
        'Incoming, in-process, and final inspection on every production run.' => 'Inspeksi material masuk, selama proses, dan akhir pada setiap proses produksi.',
        'Raw materials are inspected on arrival, parts are checked at defined intervals during production, and every shipment undergoes final inspection before release.' => 'Bahan baku diperiksa saat tiba, komponen dicek pada interval tertentu selama produksi, dan setiap pengiriman menjalani inspeksi akhir sebelum dilepas.',
        'Continuous Improvement' => 'Perbaikan Berkelanjutan',
        'Kaizen-driven process reviews across all production lines.' => 'Tinjauan proses berbasis Kaizen di seluruh lini produksi.',
        'Production teams run regular process reviews to identify defect sources and reduce variation, with corrective actions tracked to closure.' => 'Tim produksi rutin meninjau proses untuk menemukan sumber cacat dan mengurangi variasi, dengan tindakan korektif yang dipantau hingga tuntas.',
    ];

    /** Indonesian text that was stored as English => its English version. */
    private const ENGLISH_FOR_INDONESIAN = [
        'Sekilas Tentang Kami' => 'About Us at a Glance',
        'Didirikan pada tahun 2017, PT Kenco Manufactur Indonesia bergerak di bidang manufaktur dan metal stamping untuk mendukung kebutuhan industri otomotif. Didukung empat Business Unit, perusahaan terus berkembang dengan mengutamakan kualitas dan kepuasan pelanggan.' => 'Founded in 2017, PT Kenco Manufactur Indonesia works in manufacturing and metal stamping to support the automotive industry. Backed by four business units, the company keeps growing by putting quality and customer satisfaction first.',
        'Berfokus pada solusi manufaktur yang efisien, berkualitas, dan sesuai kebutuhan pelanggan.' => 'Focused on manufacturing solutions that are efficient, high-quality, and tailored to customer needs.',
    ];

    /** @var array<string, string>|null */
    private ?array $drafts = null;

    public function up(): void
    {
        $this->rewriteColumns(fn (array $map) => $this->addDraft($map));
        $this->rewriteSectionContent(fn (mixed $value) => $this->draftContent($value));
    }

    public function down(): void
    {
        $this->rewriteColumns(fn (array $map) => $this->removeDraft($map));
        $this->rewriteSectionContent(fn (mixed $value) => $this->undraftContent($value));
    }

    /**
     * English source => Indonesian draft, including the generated article
     * bodies ("<p>{excerpt} {closing}</p>").
     *
     * @return array<string, string>
     */
    private function drafts(): array
    {
        if ($this->drafts !== null) {
            return $this->drafts;
        }

        $drafts = self::DRAFTS;

        foreach (self::DRAFTS as $english => $indonesian) {
            if (str_ends_with($english, '.') && ! str_contains($english, '<')) {
                $drafts["<p>{$english} ".self::ARTICLE_CLOSING_EN.'</p>'] = "<p>{$indonesian} ".self::ARTICLE_CLOSING_ID.'</p>';
            }
        }

        return $this->drafts = $drafts;
    }

    /** @param  array<string, mixed>  $map */
    private function addDraft(array $map): ?array
    {
        if (trim((string) ($map['id'] ?? '')) !== '') {
            return null;
        }

        $english = $map['en'] ?? null;

        if (! is_string($english)) {
            return null;
        }

        if (isset($this->drafts()[$english])) {
            return ['en' => $english, 'id' => $this->drafts()[$english]];
        }

        if (isset(self::ENGLISH_FOR_INDONESIAN[$english])) {
            return ['en' => self::ENGLISH_FOR_INDONESIAN[$english], 'id' => $english];
        }

        return null;
    }

    /** @param  array<string, mixed>  $map */
    private function removeDraft(array $map): ?array
    {
        $english = $map['en'] ?? null;
        $indonesian = $map['id'] ?? null;

        if (! is_string($english) || ! is_string($indonesian)) {
            return null;
        }

        if (($this->drafts()[$english] ?? null) === $indonesian) {
            return ['en' => $english];
        }

        if ((self::ENGLISH_FOR_INDONESIAN[$indonesian] ?? null) === $english) {
            return ['en' => $indonesian];
        }

        return null;
    }

    private function draftContent(mixed $value): mixed
    {
        if (is_string($value)) {
            return $this->addDraft(['en' => $value]) ?? $value;
        }

        if (! is_array($value)) {
            return $value;
        }

        if ($this->isLocaleMap($value)) {
            return $this->addDraft($value) ?? $value;
        }

        return array_map(fn ($item) => $this->draftContent($item), $value);
    }

    private function undraftContent(mixed $value): mixed
    {
        if (! is_array($value)) {
            return $value;
        }

        if ($this->isLocaleMap($value)) {
            $restored = $this->removeDraft($value);

            // A map left with English only goes back to a plain string.
            return $restored !== null ? $restored['en'] : $value;
        }

        return array_map(fn ($item) => $this->undraftContent($item), $value);
    }

    /** @param  callable(array<string, mixed>): ?array  $transform */
    private function rewriteColumns(callable $transform): void
    {
        foreach (self::COLUMNS as $table => $columns) {
            DB::table($table)->orderBy('id')->chunkById(200, function ($rows) use ($table, $columns, $transform) {
                foreach ($rows as $row) {
                    $changes = [];

                    foreach ($columns as $column) {
                        $map = json_decode((string) ($row->{$column} ?? ''), true);

                        if (! is_array($map) || ! $this->isLocaleMap($map)) {
                            continue;
                        }

                        $next = $transform($map);

                        if ($next !== null) {
                            $changes[$column] = json_encode($next, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                        }
                    }

                    if ($changes !== []) {
                        DB::table($table)->where('id', $row->id)->update($changes);
                    }
                }
            });
        }
    }

    /** @param  callable(mixed): mixed  $transform */
    private function rewriteSectionContent(callable $transform): void
    {
        DB::table('page_sections')->whereNotNull('content')->orderBy('id')->chunkById(200, function ($rows) use ($transform) {
            foreach ($rows as $row) {
                $content = json_decode((string) $row->content, true);

                if (! is_array($content)) {
                    continue;
                }

                $next = $transform($content);

                if ($next !== $content) {
                    DB::table('page_sections')->where('id', $row->id)->update([
                        'content' => json_encode($next, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    ]);
                }
            }
        });
    }

    private function isLocaleMap(array $value): bool
    {
        return $value !== [] && ! array_is_list($value) && array_diff(array_keys($value), ['en', 'id']) === [];
    }
};
