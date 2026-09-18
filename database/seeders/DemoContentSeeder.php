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

/**
 * Realistic sample content across every public page, purely additive —
 * never deletes or touches existing rows, safe to run repeatedly (models
 * without a natural unique key just grow; re-running does not corrupt
 * anything, it only adds more sample rows).
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
        [$capabilities] = $this->seedCapabilities();
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

        return collect($names)->map(fn (array $i) => Industry::factory()->published()->create([
            'name' => $i['name'],
            'slug' => \Illuminate\Support\Str::slug($i['name']),
            'description' => $i['description'],
        ]));
    }

    private function seedCertifications()
    {
        $certs = [
            ['name' => 'ISO 9001:2015', 'issuer' => 'SGS'],
            ['name' => 'IATF 16949:2016', 'issuer' => 'TÜV Rheinland'],
            ['name' => 'ISO 14001:2015', 'issuer' => 'SGS'],
            ['name' => 'ISO 45001:2018', 'issuer' => 'Bureau Veritas'],
        ];

        return collect($certs)->map(fn (array $c, int $i) => Certification::factory()->published()->create([
            'name' => $c['name'],
            'issuer' => $c['issuer'],
            'sort_order' => $i,
        ]));
    }

    private function seedQualityContent()
    {
        $items = [
            ['title' => 'Quality Policy', 'summary' => 'Our commitment to zero-defect manufacturing at every stage.'],
            ['title' => 'Inspection Process', 'summary' => 'Incoming, in-process, and final inspection on every production run.'],
            ['title' => 'Continuous Improvement', 'summary' => 'Kaizen-driven process reviews across all production lines.'],
        ];

        return collect($items)->map(fn (array $q, int $i) => QualityContent::factory()->published()->create([
            'title' => $q['title'],
            'slug' => \Illuminate\Support\Str::slug($q['title']),
            'summary' => $q['summary'],
            'sort_order' => $i,
        ]));
    }

    private function seedCapabilities(): array
    {
        $defs = [
            [
                'name' => 'Metal Stamping',
                'summary' => 'High-volume progressive die stamping for precision metal components.',
                'steps' => ['Tool & Die Design', 'Progressive Die Stamping', 'In-line Quality Inspection'],
            ],
            [
                'name' => 'Injection Molding',
                'summary' => 'Precision plastic injection molding from prototype through mass production.',
                'steps' => ['Mold Design & Simulation', 'Injection Molding', 'Post-Mold Finishing'],
            ],
            [
                'name' => 'CNC Machining',
                'summary' => 'Multi-axis CNC machining for tight-tolerance metal and plastic parts.',
                'steps' => ['CAM Programming', 'Multi-Axis Machining', 'Dimensional Inspection'],
            ],
            [
                'name' => 'Assembly & Testing',
                'summary' => 'Sub-assembly, functional testing, and final packaging.',
                'steps' => ['Sub-Assembly', 'Functional Testing', 'Packaging & Kitting'],
            ],
        ];

        $capabilities = collect($defs)->map(function (array $c) {
            $capability = Capability::factory()->published()->create([
                'name' => $c['name'],
                'slug' => \Illuminate\Support\Str::slug($c['name']),
                'summary' => $c['summary'],
            ]);

            foreach ($c['steps'] as $i => $title) {
                CapabilityStep::create([
                    'capability_id' => $capability->id,
                    'title' => $title,
                    'description' => null,
                    'sort_order' => $i,
                ]);
            }

            return $capability;
        });

        return [$capabilities];
    }

    private function seedProducts()
    {
        $category = ProductCategory::factory()->create(['name' => 'Stamped Metal Components']);
        $category2 = ProductCategory::factory()->create(['name' => 'Molded Plastic Parts']);

        $defs = [
            ['name' => 'Precision Bracket Assembly', 'category' => $category, 'featured' => true],
            ['name' => 'Structural Mounting Plate', 'category' => $category, 'featured' => false],
            ['name' => 'Stamped Connector Terminal', 'category' => $category, 'featured' => false],
            ['name' => 'Injection Molded Housing', 'category' => $category2, 'featured' => true],
            ['name' => 'Precision Gear Component', 'category' => $category2, 'featured' => false],
            ['name' => 'Custom Enclosure Panel', 'category' => $category2, 'featured' => false],
        ];

        return collect($defs)->map(fn (array $p) => Product::factory()->published()->create([
            'product_category_id' => $p['category']->id,
            'name' => $p['name'],
            'slug' => \Illuminate\Support\Str::slug($p['name']),
            'short_description' => 'Manufactured to customer print specifications with full dimensional traceability.',
            'is_featured' => $p['featured'],
        ]));
    }

    private function seedFacilities()
    {
        $category = FacilityCategory::factory()->create(['name' => 'Manufacturing Plant']);

        $defs = [
            'Plant 1 — Stamping & Assembly',
            'Plant 2 — Injection Molding',
        ];

        return collect($defs)->map(function (string $name) use ($category) {
            $facility = Facility::factory()->published()->create([
                'facility_category_id' => $category->id,
                'name' => $name,
                'slug' => \Illuminate\Support\Str::slug($name),
                'location' => 'Karawang, West Java, Indonesia',
            ]);

            Machine::factory()->count(3)->create(['facility_id' => $facility->id]);

            return $facility;
        });
    }

    private function seedMilestones(): void
    {
        $timeline = [
            ['year' => 2005, 'title' => 'Company Founded', 'description' => 'Started operations as a precision metal stamping supplier.'],
            ['year' => 2010, 'title' => 'ISO 9001 Certified', 'description' => 'Achieved our first quality management certification.'],
            ['year' => 2015, 'title' => 'Plant 2 Opened', 'description' => 'Expanded into injection molding with a second production facility.'],
            ['year' => 2020, 'title' => 'Automation Upgrade', 'description' => 'Introduced automated inspection across all production lines.'],
            ['year' => 2024, 'title' => 'IATF 16949 Certified', 'description' => 'Certified to the automotive industry quality standard.'],
        ];

        foreach ($timeline as $i => $m) {
            Milestone::factory()->create([
                'year' => $m['year'],
                'title' => $m['title'],
                'description' => $m['description'],
                'order' => $i,
            ]);
        }
    }

    private function seedNews(?User $author): void
    {
        $categories = collect(['Company News', 'Product Updates', 'Industry Insights'])
            ->map(fn (string $name) => NewsCategory::factory()->create(['name' => $name]));

        $titles = [
            'Kenco Manufactur Achieves IATF 16949 Certification',
            'New Injection Molding Line Now Operational',
            'Expanding Our Automotive Supply Partnerships',
            'How We Reduced Defect Rates Through Automation',
            'Kenco Manufactur Joins Regional Manufacturing Association',
            'Year in Review: Production Milestones',
        ];

        foreach ($titles as $i => $title) {
            Article::factory()->published()->create([
                'news_category_id' => $categories[$i % $categories->count()]->id,
                'author_id' => $author?->id,
                'title' => $title,
                'slug' => \Illuminate\Support\Str::slug($title),
                'excerpt' => 'A brief update from the Kenco Manufactur production floor and leadership team.',
                'is_featured' => $i === 0,
                'published_at' => now()->subDays($i * 3),
            ]);
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
            JobVacancy::factory()->published()->create([
                'title' => $r['title'],
                'slug' => \Illuminate\Support\Str::slug($r['title'].'-'.uniqid()),
                'department' => $r['department'],
                'location' => 'Karawang, West Java, Indonesia',
                'employment_type' => $r['type'],
            ]);
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
                'section_type' => SectionType::Text,
                'title' => 'Who We Are',
                'subtitle' => null,
                'content' => ['body' => 'PT. Kenco Manufactur Indonesia is a precision manufacturing partner serving automotive, electronics, and industrial customers. We combine metal stamping, injection molding, and CNC machining under one roof to deliver components on schedule and to print.'],
                'sort_order' => 0,
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
                'sort_order' => 1,
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
