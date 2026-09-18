<?php

namespace Database\Seeders;

use App\Enums\ContentStatus;
use App\Enums\PageType;
use App\Enums\SectionType;
use App\Models\Article;
use App\Models\Capability;
use App\Models\CapabilityStep;
use App\Models\Certification;
use App\Models\Facility;
use App\Models\FacilityCategory;
use App\Models\Industry;
use App\Models\JobVacancy;
use App\Models\Machine;
use App\Models\Milestone;
use App\Models\NewsCategory;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\QualityContent;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Realistic sample content across every public page, purely additive —
 * never deletes or touches existing rows. Idempotent: every record is
 * created via firstOrCreate() keyed on its natural unique field (slug,
 * or name where no slug exists), so running this multiple times updates
 * nothing and never hits a duplicate-entry error — it just leaves
 * already-seeded rows as they are.
 *
 * Deliberately uses plain Model::create() with explicit literal values
 * instead of factories/fake() — factories depend on fakerphp/faker, which
 * is require-dev only and is not installed on staging/production
 * (deploy scripts run `composer install --no-dev`). This seeder must run
 * there, so it cannot depend on a dev-only package.
 *
 * No real photography exists yet, so every image field is left null — the
 * ImagePlaceholder fallback already used throughout the public site
 * handles that gracefully. This seeder exists purely so every page has
 * something to review; it is not meant to represent final content.
 */
class DemoContentSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@kenco.test')->first();

        $industries = $this->seedIndustries();
        $certifications = $this->seedCertifications();
        $qualityContents = $this->seedQualityContent();
        $capabilities = $this->seedCapabilities();
        $products = $this->seedProducts();
        $facilities = $this->seedFacilities();
        $this->seedMilestones();
        $this->seedNews($admin);
        $this->seedCareers();
        $this->seedCompanyPages();
        $this->seedHomepage($capabilities, $products, $facilities);

        $this->command?->info('Demo content seeded: '
            .$industries->count().' industries, '
            .$certifications->count().' certifications, '
            .$qualityContents->count().' quality items, '
            .$capabilities->count().' capabilities, '
            .$products->count().' products, '
            .$facilities->count().' facilities.');
    }

    private function seedIndustries()
    {
        $names = [
            ['name' => 'Automotive', 'description' => 'Precision components for tier-1 and tier-2 automotive suppliers.'],
            ['name' => 'Electronics', 'description' => 'Enclosures and structural parts for consumer and industrial electronics.'],
            ['name' => 'Aerospace', 'description' => 'Tight-tolerance machined parts for aerospace subassemblies.'],
            ['name' => 'Industrial Equipment', 'description' => 'Structural and mechanical components for heavy machinery OEMs.'],
            ['name' => 'Consumer Goods', 'description' => 'High-volume plastic and metal parts for consumer product brands.'],
        ];

        return collect($names)->map(fn (array $i) => Industry::query()->firstOrCreate(
            ['slug' => Str::slug($i['name'])],
            [
                'name' => $i['name'],
                'description' => $i['description'],
                'status' => ContentStatus::Published,
                'published_at' => now()->subDay(),
            ],
        ));
    }

    private function seedCertifications()
    {
        $certs = [
            ['name' => 'ISO 9001:2015', 'issuer' => 'SGS', 'number' => 'CERT-9001-2015'],
            ['name' => 'IATF 16949:2016', 'issuer' => 'TÜV Rheinland', 'number' => 'CERT-16949-2016'],
            ['name' => 'ISO 14001:2015', 'issuer' => 'SGS', 'number' => 'CERT-14001-2015'],
            ['name' => 'ISO 45001:2018', 'issuer' => 'Bureau Veritas', 'number' => 'CERT-45001-2018'],
        ];

        return collect($certs)->map(fn (array $c, int $i) => Certification::query()->firstOrCreate(
            ['certificate_number' => $c['number']],
            [
                'name' => $c['name'],
                'issuer' => $c['issuer'],
                'issued_at' => now()->subYears(2),
                'expires_at' => now()->addYears(2),
                'sort_order' => $i,
                'status' => ContentStatus::Published,
                'published_at' => now()->subDay(),
            ],
        ));
    }

    private function seedQualityContent()
    {
        $items = [
            ['title' => 'Quality Policy', 'summary' => 'Our commitment to zero-defect manufacturing at every stage.', 'content' => 'Every product that leaves our facilities is manufactured under documented process controls, with quality built in at each station rather than inspected in at the end.'],
            ['title' => 'Inspection Process', 'summary' => 'Incoming, in-process, and final inspection on every production run.', 'content' => 'Raw materials are inspected on arrival, parts are checked at defined intervals during production, and every shipment undergoes final inspection before release.'],
            ['title' => 'Continuous Improvement', 'summary' => 'Kaizen-driven process reviews across all production lines.', 'content' => 'Production teams run regular process reviews to identify defect sources and reduce variation, with corrective actions tracked to closure.'],
        ];

        return collect($items)->map(fn (array $q, int $i) => QualityContent::query()->firstOrCreate(
            ['slug' => Str::slug($q['title'])],
            [
                'title' => $q['title'],
                'summary' => $q['summary'],
                'content' => $q['content'],
                'sort_order' => $i,
                'status' => ContentStatus::Published,
                'published_at' => now()->subDay(),
            ],
        ));
    }

    private function seedCapabilities()
    {
        $defs = [
            [
                'name' => 'Metal Stamping',
                'summary' => 'High-volume progressive die stamping for precision metal components.',
                'description' => 'Our stamping lines run progressive dies for high-volume metal components, from prototype tooling through full production, with in-line dimensional checks on every run.',
                'steps' => ['Tool & Die Design', 'Progressive Die Stamping', 'In-line Quality Inspection'],
            ],
            [
                'name' => 'Injection Molding',
                'summary' => 'Precision plastic injection molding from prototype through mass production.',
                'description' => 'From mold design and flow simulation through mass production, our molding presses handle engineering-grade resins for structural and cosmetic plastic parts.',
                'steps' => ['Mold Design & Simulation', 'Injection Molding', 'Post-Mold Finishing'],
            ],
            [
                'name' => 'CNC Machining',
                'summary' => 'Multi-axis CNC machining for tight-tolerance metal and plastic parts.',
                'description' => 'Multi-axis CNC centers machine metal and plastic parts to tight tolerances, programmed directly from customer CAD data and verified on CMM equipment.',
                'steps' => ['CAM Programming', 'Multi-Axis Machining', 'Dimensional Inspection'],
            ],
            [
                'name' => 'Assembly & Testing',
                'summary' => 'Sub-assembly, functional testing, and final packaging.',
                'description' => 'We combine components into finished sub-assemblies, run functional testing against customer specifications, and package for direct shipment to the production line.',
                'steps' => ['Sub-Assembly', 'Functional Testing', 'Packaging & Kitting'],
            ],
        ];

        return collect($defs)->map(function (array $c) {
            $capability = Capability::query()->firstOrCreate(
                ['slug' => Str::slug($c['name'])],
                [
                    'name' => $c['name'],
                    'summary' => $c['summary'],
                    'description' => $c['description'],
                    'status' => ContentStatus::Published,
                    'published_at' => now()->subDay(),
                ],
            );

            if ($capability->steps()->count() === 0) {
                foreach ($c['steps'] as $i => $title) {
                    CapabilityStep::create([
                        'capability_id' => $capability->id,
                        'title' => $title,
                        'description' => null,
                        'sort_order' => $i,
                    ]);
                }
            }

            return $capability;
        });
    }

    private function seedProducts()
    {
        $category = ProductCategory::query()->firstOrCreate(
            ['slug' => 'stamped-metal-components'],
            [
                'name' => 'Stamped Metal Components',
                'description' => 'Precision stamped metal parts for automotive and industrial assemblies.',
                'sort_order' => 0,
                'status' => ContentStatus::Published,
            ],
        );

        $category2 = ProductCategory::query()->firstOrCreate(
            ['slug' => 'molded-plastic-parts'],
            [
                'name' => 'Molded Plastic Parts',
                'description' => 'Injection molded plastic components and housings.',
                'sort_order' => 1,
                'status' => ContentStatus::Published,
            ],
        );

        $defs = [
            ['name' => 'Precision Bracket Assembly', 'category' => $category, 'featured' => true],
            ['name' => 'Structural Mounting Plate', 'category' => $category, 'featured' => false],
            ['name' => 'Stamped Connector Terminal', 'category' => $category, 'featured' => false],
            ['name' => 'Injection Molded Housing', 'category' => $category2, 'featured' => true],
            ['name' => 'Precision Gear Component', 'category' => $category2, 'featured' => false],
            ['name' => 'Custom Enclosure Panel', 'category' => $category2, 'featured' => false],
        ];

        return collect($defs)->map(fn (array $p) => Product::query()->firstOrCreate(
            ['slug' => Str::slug($p['name'])],
            [
                'product_category_id' => $p['category']->id,
                'name' => $p['name'],
                'short_description' => 'Manufactured to customer print specifications with full dimensional traceability.',
                'description' => 'Produced on our precision production lines under documented process controls, with material certification and dimensional reports available on request.',
                'is_featured' => $p['featured'],
                'status' => ContentStatus::Published,
                'published_at' => now()->subDay(),
            ],
        ));
    }

    private function seedFacilities()
    {
        $category = FacilityCategory::query()->firstOrCreate(
            ['slug' => 'manufacturing-plant'],
            [
                'name' => 'Manufacturing Plant',
                'description' => 'Primary production facilities.',
                'sort_order' => 0,
                'status' => ContentStatus::Published,
            ],
        );

        $machineDefs = [
            ['name' => 'Progressive Stamping Press', 'brand' => 'Komatsu', 'model' => 'OBS-250', 'capacity' => '250 ton', 'quantity' => 4],
            ['name' => 'Horizontal Injection Molder', 'brand' => 'Arburg', 'model' => 'Allrounder 570', 'capacity' => '150 ton', 'quantity' => 3],
            ['name' => '5-Axis CNC Machining Center', 'brand' => 'DMG Mori', 'model' => 'DMU 50', 'capacity' => 'N/A', 'quantity' => 2],
        ];

        $defs = [
            'Plant 1 — Stamping & Assembly',
            'Plant 2 — Injection Molding',
        ];

        return collect($defs)->map(function (string $name) use ($category, $machineDefs) {
            $facility = Facility::query()->firstOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'facility_category_id' => $category->id,
                    'name' => $name,
                    'location' => 'Karawang, West Java, Indonesia',
                    'description' => 'A production facility operating under ISO 9001 and IATF 16949 quality management systems.',
                    'status' => ContentStatus::Published,
                    'published_at' => now()->subDay(),
                ],
            );

            if ($facility->machines()->count() === 0) {
                foreach ($machineDefs as $i => $m) {
                    Machine::create([
                        'facility_id' => $facility->id,
                        'name' => $m['name'],
                        'brand' => $m['brand'],
                        'model' => $m['model'],
                        'quantity' => $m['quantity'],
                        'capacity' => $m['capacity'],
                        'description' => null,
                        'specification' => null,
                        'sort_order' => $i,
                        'status' => ContentStatus::Published,
                        'is_active' => true,
                    ]);
                }
            }

            return $facility;
        });
    }

    private function seedMilestones(): void
    {
        // Milestone has no natural unique column, so guard idempotency at
        // the batch level instead — skip entirely if any milestone already
        // exists rather than risking duplicate timeline entries.
        if (Milestone::query()->count() > 0) {
            return;
        }

        $timeline = [
            ['year' => 2005, 'title' => 'Company Founded', 'description' => 'Started operations as a precision metal stamping supplier.'],
            ['year' => 2010, 'title' => 'ISO 9001 Certified', 'description' => 'Achieved our first quality management certification.'],
            ['year' => 2015, 'title' => 'Plant 2 Opened', 'description' => 'Expanded into injection molding with a second production facility.'],
            ['year' => 2020, 'title' => 'Automation Upgrade', 'description' => 'Introduced automated inspection across all production lines.'],
            ['year' => 2024, 'title' => 'IATF 16949 Certified', 'description' => 'Certified to the automotive industry quality standard.'],
        ];

        foreach ($timeline as $i => $m) {
            Milestone::create([
                'year' => $m['year'],
                'title' => $m['title'],
                'description' => $m['description'],
                'order' => $i,
            ]);
        }
    }

    private function seedNews(?User $author): void
    {
        $categories = collect([
            ['name' => 'Company News', 'slug' => 'company-news'],
            ['name' => 'Product Updates', 'slug' => 'product-updates'],
            ['name' => 'Industry Insights', 'slug' => 'industry-insights'],
        ])->map(fn (array $c) => NewsCategory::query()->firstOrCreate(['slug' => $c['slug']], $c));

        $articles = [
            ['title' => 'Kenco Manufactur Achieves IATF 16949 Certification', 'excerpt' => 'Our quality management system is now certified to the automotive industry standard.'],
            ['title' => 'New Injection Molding Line Now Operational', 'excerpt' => 'Plant 2 has added a new production line to support growing customer demand.'],
            ['title' => 'Expanding Our Automotive Supply Partnerships', 'excerpt' => 'We are pleased to announce new partnerships with tier-1 automotive suppliers.'],
            ['title' => 'How We Reduced Defect Rates Through Automation', 'excerpt' => 'A look at the automated inspection systems now running across our production lines.'],
            ['title' => 'Kenco Manufactur Joins Regional Manufacturing Association', 'excerpt' => 'Strengthening our connections within the regional manufacturing community.'],
            ['title' => 'Year in Review: Production Milestones', 'excerpt' => 'A look back at the production milestones reached this year.'],
        ];

        foreach ($articles as $i => $a) {
            Article::query()->firstOrCreate(
                ['slug' => Str::slug($a['title'])],
                [
                    'news_category_id' => $categories[$i % $categories->count()]->id,
                    'author_id' => $author?->id,
                    'title' => $a['title'],
                    'excerpt' => $a['excerpt'],
                    'content' => '<p>'.$a['excerpt'].' Our team continues to invest in process discipline and equipment to serve our customers reliably.</p>',
                    'is_featured' => $i === 0,
                    'status' => ContentStatus::Published,
                    'published_at' => now()->subDays($i * 3),
                ],
            );
        }
    }

    private function seedCareers(): void
    {
        $roles = [
            ['title' => 'CNC Machine Operator', 'department' => 'Production', 'type' => 'full-time'],
            ['title' => 'Quality Control Inspector', 'department' => 'Quality Assurance', 'type' => 'full-time'],
            ['title' => 'Manufacturing Engineer', 'department' => 'Engineering', 'type' => 'full-time'],
            ['title' => 'Production Intern', 'department' => 'Production', 'type' => 'internship'],
        ];

        foreach ($roles as $r) {
            JobVacancy::query()->firstOrCreate(
                ['slug' => Str::slug($r['title'])],
                [
                    'title' => $r['title'],
                    'department' => $r['department'],
                    'location' => 'Karawang, West Java, Indonesia',
                    'employment_type' => $r['type'],
                    'description' => 'We are looking for a '.$r['title'].' to join our '.$r['department'].' team in Karawang.',
                    'requirements' => 'Relevant experience in a manufacturing environment, strong attention to detail, and willingness to work in a production setting.',
                    'status' => ContentStatus::Published,
                    'published_at' => now()->subDay(),
                ],
            );
        }
    }

    private function seedCompanyPages(): void
    {
        $company = Page::query()->firstOrCreate(
            ['slug' => 'company'],
            [
                'title' => 'Company',
                'page_type' => PageType::Standard,
                'status' => ContentStatus::Published,
                'published_at' => now()->subDay(),
            ],
        );

        if ($company->sections()->count() === 0) {
            $company->sections()->create([
                'section_type' => SectionType::Hero,
                'title' => 'Sekilas Tentang Kami',
                'content' => [
                    'heading' => 'Sekilas Tentang Kami',
                    'description' => 'Didirikan pada tahun 2017, PT Kenco Manufactur Indonesia bergerak di bidang manufaktur dan metal stamping untuk mendukung kebutuhan industri otomotif. Didukung empat Business Unit, perusahaan terus berkembang dengan mengutamakan kualitas dan kepuasan pelanggan.',
                    'highlight' => 'Berfokus pada solusi manufaktur yang efisien, berkualitas, dan sesuai kebutuhan pelanggan.',
                    'image' => 'library/company-about-hero.png',
                ],
                'sort_order' => 0,
                'is_active' => true,
            ]);

            $company->sections()->create([
                'section_type' => SectionType::Text,
                'title' => 'Who We Are',
                'subtitle' => null,
                'content' => ['body' => 'PT. Kenco Manufactur Indonesia is a precision manufacturing partner serving automotive, electronics, and industrial customers. We combine metal stamping, injection molding, and CNC machining under one roof to deliver components on schedule and to print.'],
                'sort_order' => 1,
                'is_active' => true,
            ]);

            $company->sections()->create([
                'section_type' => SectionType::Stats,
                'title' => 'By the Numbers',
                'content' => ['items' => [
                    ['label' => 'Founded', 'value' => '2005'],
                    ['label' => 'Employees', 'value' => '350+'],
                    ['label' => 'Facilities', 'value' => '2'],
                    ['label' => 'Countries Served', 'value' => '8'],
                ]],
                'sort_order' => 2,
                'is_active' => true,
            ]);
        }

        $visionMission = Page::query()->firstOrCreate(
            ['slug' => 'company/vision-mission'],
            [
                'title' => 'Vision & Mission',
                'page_type' => PageType::Standard,
                'status' => ContentStatus::Published,
                'published_at' => now()->subDay(),
            ],
        );

        if ($visionMission->sections()->count() === 0) {
            $visionMission->sections()->create([
                'section_type' => SectionType::Text,
                'title' => 'Our Vision',
                'content' => ['body' => 'To be the most trusted precision manufacturing partner for automotive and industrial customers in Southeast Asia.'],
                'sort_order' => 0,
                'is_active' => true,
            ]);

            $visionMission->sections()->create([
                'section_type' => SectionType::Text,
                'title' => 'Our Mission',
                'content' => ['body' => 'We deliver zero-defect components on time, every time, through disciplined process control, continuous improvement, and investment in our people.'],
                'sort_order' => 1,
                'is_active' => true,
            ]);
        }
    }

    private function seedHomepage($capabilities, $products, $facilities): void
    {
        $home = Page::query()->firstOrCreate(
            ['page_type' => PageType::Homepage],
            [
                'title' => 'Home',
                'slug' => 'home',
                'status' => ContentStatus::Published,
                'published_at' => now()->subDay(),
            ],
        );

        if ($home->status !== ContentStatus::Published) {
            $home->update(['status' => ContentStatus::Published, 'published_at' => now()->subDay()]);
        }

        if ($home->sections()->count() > 0) {
            $this->command?->info('Homepage already has sections — leaving them as-is.');

            return;
        }

        $order = 0;

        $home->sections()->create([
            'section_type' => SectionType::Hero,
            'title' => 'Precision Manufacturing, Built to Last',
            'content' => [
                'eyebrow' => 'Since 2005',
                'heading' => 'Precision Manufacturing, Built to Last',
                'description' => 'We engineer and manufacture stamped metal, molded plastic, and machined components for automotive and industrial customers worldwide.',
                'primary_cta_label' => 'Our Capabilities',
                'primary_cta_url' => '/capabilities',
                'secondary_cta_label' => 'Contact Us',
                'secondary_cta_url' => '/contact',
            ],
            'sort_order' => $order++,
            'is_active' => true,
        ]);

        $home->sections()->create([
            'section_type' => SectionType::CompanyIntro,
            'title' => 'Engineered for Reliability',
            'subtitle' => 'From tool design through final assembly, every part we produce is built to print and backed by full dimensional traceability — the same discipline our automotive and industrial customers rely on.',
            'content' => [],
            'sort_order' => $order++,
            'is_active' => true,
        ]);

        $home->sections()->create([
            'section_type' => SectionType::Stats,
            'content' => ['items' => [
                ['label' => 'Years in Operation', 'value' => '20+'],
                ['label' => 'Employees', 'value' => '350+'],
                ['label' => 'Production Facilities', 'value' => '2'],
                ['label' => 'On-Time Delivery', 'value' => '98%'],
            ]],
            'sort_order' => $order++,
            'is_active' => true,
        ]);

        $home->sections()->create([
            'section_type' => SectionType::Capabilities,
            'title' => 'What We Do',
            'content' => ['heading' => 'Manufacturing Capabilities', 'capability_ids' => $capabilities->pluck('id')->take(3)->all()],
            'sort_order' => $order++,
            'is_active' => true,
        ]);

        $home->sections()->create([
            'section_type' => SectionType::Products,
            'content' => ['heading' => 'Featured Products', 'product_ids' => $products->pluck('id')->take(3)->all()],
            'sort_order' => $order++,
            'is_active' => true,
        ]);

        $home->sections()->create([
            'section_type' => SectionType::Facilities,
            'content' => ['heading' => 'Where We Manufacture', 'facility_ids' => $facilities->pluck('id')->take(1)->all()],
            'sort_order' => $order++,
            'is_active' => true,
        ]);

        $home->sections()->create([
            'section_type' => SectionType::Quality,
            'title' => 'Quality You Can Verify',
            'subtitle' => 'Every facility operates under ISO 9001 and IATF 16949, with in-line inspection on every production run.',
            'content' => [],
            'sort_order' => $order++,
            'is_active' => true,
        ]);

        $home->sections()->create([
            'section_type' => SectionType::News,
            'content' => [],
            'sort_order' => $order++,
            'is_active' => true,
        ]);

        $home->sections()->create([
            'section_type' => SectionType::CareerCta,
            'title' => 'Join Our Team',
            'content' => ['cta_label' => 'View Openings'],
            'sort_order' => $order++,
            'is_active' => true,
        ]);

        $home->sections()->create([
            'section_type' => SectionType::ContactCta,
            'title' => 'Let\'s discuss your next production run',
            'content' => [],
            'sort_order' => $order++,
            'is_active' => true,
        ]);
    }
}
