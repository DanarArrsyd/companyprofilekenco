<?php

namespace App\Http\Controllers\Public;

use App\Enums\PageType;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Capability;
use App\Models\Certification;
use App\Models\Facility;
use App\Models\Industry;
use App\Models\JobVacancy;
use App\Models\Page;
use App\Models\Product;
use App\Models\QualityContent;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

/**
 * Dynamic /sitemap.xml — built from the database on every request behind a
 * short cache, never a hardcoded URL list. Only canonical, published,
 * publicly reachable URLs are included (see SEO.md's exclusion rules).
 */
class SitemapController extends Controller
{
    public function index(): Response
    {
        $xml = Cache::remember('sitemap.xml', now()->addMinutes(30), fn () => $this->build());

        return response($xml, 200)->header('Content-Type', 'application/xml; charset=UTF-8');
    }

    private function build(): string
    {
        $urls = collect();

        $homepage = Page::query()->where('page_type', PageType::Homepage)->published()->first();
        $urls->push($this->entry(url('/'), $homepage?->updated_at));

        Page::query()
            ->standard()
            ->published()
            ->where(fn ($q) => $q->where('slug', 'company')->orWhere('slug', 'like', 'company/%'))
            ->get(['slug', 'updated_at'])
            ->each(fn (Page $page) => $urls->push($this->entry(url("/{$page->slug}"), $page->updated_at)));

        $products = Product::query()->published()->get(['slug', 'updated_at']);
        $urls->push($this->entry(url('/products'), $products->max('updated_at')));
        $products->each(fn (Product $p) => $urls->push($this->entry(url("/products/{$p->slug}"), $p->updated_at)));

        $capabilities = Capability::query()->published()->get(['slug', 'updated_at']);
        $urls->push($this->entry(url('/capabilities'), $capabilities->max('updated_at')));
        $capabilities->each(fn (Capability $c) => $urls->push($this->entry(url("/capabilities/{$c->slug}"), $c->updated_at)));

        $facilities = Facility::query()->published()->get(['updated_at']);
        $urls->push($this->entry(url('/facilities'), $facilities->max('updated_at')));

        $quality = QualityContent::query()->published()->get(['updated_at']);
        $urls->push($this->entry(url('/quality'), $quality->max('updated_at')));

        $certifications = Certification::query()->published()->get(['updated_at']);
        $urls->push($this->entry(url('/certifications'), $certifications->max('updated_at')));

        $industries = Industry::query()->published()->get(['updated_at']);
        $urls->push($this->entry(url('/industries'), $industries->max('updated_at')));

        $articles = Article::query()->published()->get(['slug', 'updated_at']);
        $urls->push($this->entry(url('/news'), $articles->max('updated_at')));
        $articles->each(fn (Article $a) => $urls->push($this->entry(url("/news/{$a->slug}"), $a->updated_at)));

        $openVacancies = JobVacancy::query()
            ->published()
            ->where(fn ($q) => $q->whereNull('closes_at')->orWhere('closes_at', '>', now()))
            ->get(['slug', 'updated_at']);
        $urls->push($this->entry(url('/careers'), $openVacancies->max('updated_at')));
        $openVacancies->each(fn (JobVacancy $v) => $urls->push($this->entry(url("/careers/{$v->slug}"), $v->updated_at)));

        $urls->push($this->entry(url('/contact')));

        return view('sitemap', ['urls' => $urls])->render();
    }

    /** @return array{loc: string, lastmod: ?string} */
    private function entry(string $loc, ?Carbon $lastmod = null): array
    {
        return [
            'loc' => $loc,
            'lastmod' => $lastmod?->toAtomString(),
        ];
    }
}
