# Phase 9A — Public Website Visual Audit & Final UI/UX Plan

Status: analysis only. No UI source code changed in this phase.
Source of truth for Phase 9B, 9C, 9D implementation.

---

## 1. Executive Summary

The site is functionally complete (Phase 1–8) on a correctly specified design foundation — the semantic tokens in `tailwind.config.js` / `resources/css/app.css` already match DESIGN.md's Modern Industrial Corporate palette exactly, Inter is loaded, `Button` is already restrained (no pill, correct radius/height).

The problem is expression, not foundation: seven unrelated content types (Products, Facilities, Quality, Certifications, Industries, and the homepage's capability/product/facility picker sections) are rendered through one identical template — a thin title band followed by a grid of `rounded border border-border bg-surface p-5` cards. This is exactly the "icon/image + title + paragraph in a rounded card, repeated per section" anti-pattern DESIGN.md and the brief name directly.

Highest-severity findings:

- Certifications render as e-commerce product cards (explicitly forbidden).
- Machine/equipment specs (brand, model, capacity, quantity — captured since Phase 6) are never shown publicly.
- Hero `image` field exists in the type but is never rendered — the hero is text on a flat surface.
- Contact page never wired to Settings (Phase 8) — no address, phone, hours, or map despite the data existing.
- Zero motion, zero breadcrumbs sitewide.

The plan: retire the generic card as the default container, replace it with two structural patterns — the **spec row** (for genuinely tabular data: machine capacity, certificate numbers) and the **editorial split** (for stories: capabilities, facilities, articles) — and build ~13 new purpose-built public components to carry them. No redesign of the token system, no new frameworks, no animation library.

Implementation is staged as 9B (foundation + homepage rebuild) → 9C (six collection/detail pages) → 9D (News/Career/Contact + motion pass + Core Web Vitals check).

---

## 2. Existing Public UI Audit

### The repeated pattern, verified across seven templates

`Products/Index`, the homepage's capability/product/facility picker sections (`SectionRenderer.tsx`), `Facilities/Index`, `Quality/Index`, `Certifications/Index`, and `Industries/Index` all render the identical structural unit:

```
section.border-b.bg-surface   (h1 + one-line dek)
  → grid gap-6 sm:grid-cols-2 lg:grid-cols-3
    of rounded border border-border bg-surface p-5
      (image optional, name, one line of muted text)
```

A production facility and a news teaser currently render through the same box.

### Page-by-page notes

| Page | What's there now | Reads as |
|---|---|---|
| Homepage | Hero, intro, stats, then picker sections sharing one card grid; News/Quality highlights repeat the same card. Hero's `image` field is typed but never rendered. | Empty CMS demo |
| Company / Vision / Milestones | Generic section renderer (text / stats / image-text). Functionally fine, no editorial framing. | Untitled CMS page |
| Products Index | Category pill filter + 3-col card grid. Reasonable filter UX, generic card. | Small e-commerce catalog |
| Product Detail | 50/50 image + spec grid, decent bones. No breadcrumb, gallery is a flat 4-up thumbnail grid, no link back to the capability/facility that made it. | Product page, unbranded |
| Capability Detail | Numbered process steps + equipment tag list — structurally the best page already. `featured_image` is captured but never displayed. | Good bones, no image |
| Facilities Index | Card grid: image, name, category, location, one line of description. Machine data (brand, model, capacity, quantity, linked capability) **never rendered publicly**. | Placeholder gallery |
| Quality Index | Stacked full-width boxes (small win over a grid) but still one bordered card per item; no distinction between commitment / inspection / system / continuous improvement. | Flat content list |
| Certifications | Centered logo, name, issuer, expiry — literally the e-commerce product-card layout the brief names by name. | **Product card (forbidden)** |
| Industries | Image + name + description card grid. No link between an industry and Kenco's capability set. | Generic tile grid |
| News Index / Detail | Featured-article block + 3-up grid is a reasonable news shape; detail has category/date/author. No breadcrumb, no large pull image. | Adequate, not editorial |
| Careers Index / Detail | List rows, not cards — the one listing page already avoiding the grid. Apply form is practical, closed-vacancy state handled. | Closest to on-brand already |
| Contact | Single-column form only. Phase 8 built address/phone/email/hours/map into Settings — **none wired into this page.** No map, no office info. | Form with no company behind it |
| Navbar / Footer | 9 flat top-level links, no dropdown, no scroll state. Footer pulls Settings (Phase 8) for name/contact/social — the one place identity already shows through. | Functional, undifferentiated |

### What's already correct — keep it

- Semantic tokens (`background`, `foreground`, `surface`, `primary`, `muted`, `border`) wired end to end, matching DESIGN.md's hex values exactly. No component reaches for a raw color.
- `Button` (`resources/js/components/ui/button.tsx`) is already restrained: 44px height, 6px radius, two real variants, no pill shape.
- Content status logic (published/draft/archived, expiry-aware certifications, closed-vacancy handling) is correct — this is a visual pass only, not a data pass.

---

## 3. Problems Found

Ranked by how visibly they undercut "manufacturing-oriented, credible, technical, precise":

| Problem | Where | Severity |
|---|---|---|
| Certifications rendered as e-commerce product cards | `public/certifications/Index.tsx` | High |
| One card template reused for 7 unrelated content types | Products, Facilities, Quality, Certifications, Industries, Home picker sections | High |
| Machine/equipment specs captured but never shown publicly | `public/facilities/Index.tsx` | High |
| Hero `image` field exists but is never rendered | `components/public/SectionRenderer.tsx` (hero case) | High |
| Contact page ignores Settings (address/phone/hours/map) from Phase 8 | `public/contact/Index.tsx` | High |
| No breadcrumb anywhere on the public site | sitewide | Medium |
| Capability detail's `featured_image` never displayed | `public/capabilities/Show.tsx` | Medium |
| Zero motion — no reveal, no hover depth, no counters on stats | sitewide | Medium |
| Type scale stops at H4 — no Body Large / Body / Small / Caption utilities, sizing is ad hoc per file | `tailwind.config.js` | Medium |
| Flat 9-item nav with no grouping | `layouts/PublicLayout.tsx` | Low |
| No `secondary` semantic token | `resources/css/app.css` | Low |

---

## 4. KEEP / REFACTOR / REPLACE / REMOVE

| Component | Status | Reasoning |
|---|---|---|
| `ui/button.tsx` | **KEEP** | Already correct to DESIGN.md — no pill, right radius, right height. |
| `components/public/SeoHead.tsx` | **KEEP** | Robots/canonical/OG logic is correct and unaffected by a visual pass. |
| `layouts/PublicLayout.tsx` | **REFACTOR** | Settings wiring (Phase 8) is correct; split header/footer into dedicated components, add scroll state + grouped nav. |
| `components/public/SectionRenderer.tsx` | **REFACTOR** | Keep as a thin dispatcher over `section_type`; extract each case's markup into dedicated components instead of inlining a generic card grid. |
| SectionRenderer's picker-card block (capabilities/products/facilities cases) | **REPLACE** | The repeated anti-pattern. Split by content type. |
| `NewsPreview`, `QualityHighlights` (inside SectionRenderer.tsx) | **REPLACE** | Promote to standalone `ArticlePreview` and a quality-specific layout; stop sharing the bordered-box markup. |
| Products/Facilities/Quality/Certifications/Industries Index pages' inline card markup | **REPLACE** | Each becomes a thin page composing a purpose-built component instead of authoring its own `rounded border p-5` block. |
| `pages/public/Page.tsx`, `Home.tsx` | **KEEP (host logic)** | Correct data flow; they only render what SectionRenderer gives them, so component-level changes flow through automatically. |
| `PublicNavbar` | **NEW** | Extracted from PublicLayout — owns dropdown, scroll-state, mobile drawer. |
| `PublicFooter` | **NEW** | Extracted from PublicLayout — owns the Settings-driven contact/social block. |
| `SectionHeader` | **NEW** | Eyebrow + heading + description, one implementation used everywhere instead of hand-rolled `h2`+`p`. |
| `Breadcrumb` (public variant) | **NEW** | Admin has one; public has none. Needed on every detail page. |
| `Hero` | **NEW** | Replaces the inline hero case — finally renders the image field, sized to content not `100vh`. |
| `MetricStrip` | **NEW** | Replaces the bare stats grid with tabular-aligned figures and optional count-up. |
| `CapabilityFeature` | **NEW** | Editorial capability presentation. |
| `ProductShowcase` | **NEW** | Spec-table product presentation, not a shop card. |
| `FacilityFeature` | **NEW** | Surfaces machine brand/model/capacity/qty and the linked capability — highest-value new component. |
| `CertificationItem` | **NEW** | Certificate-plate treatment: document-style, not a product tile. |
| `ArticlePreview` | **NEW** | Editorial teaser — category kicker, date, headline, dek, no card border. |
| `ContactInfoPanel` / `ContactCTA` | **NEW** | Wires Settings (address/phone/hours/map) into Contact and homepage's contact CTA. |

No file is deleted outright — nothing is dead code. What's retired is the *convention* of reusing one generic card container for every collection.

No duplicate components: every "new" row above replaces inline markup currently duplicated across 2–7 files. Net component count for the same coverage goes up by ~11; duplicated card markup goes to zero.

---

## 5. Final Design Direction

**Clean Corporate Precision + real industrial character.** The palette and type family DESIGN.md specifies are correct — this section defines how they get used differently than "card, everywhere."

### Two structural moves replace the card

- **The spec row.** Where content is genuinely data — machine capacity, product materials, certificate numbers — present it as a bordered-top, tabular label/value list, not a card. Numbers get `font-variant-numeric: tabular-nums` so columns of figures actually align.
- **The editorial split.** Where content is a story — a capability, a facility, an article — present it as an asymmetric image/text pairing with a numbered or labeled kicker, sized large enough that the photograph carries real weight. Never shrink the image to card-thumbnail size to fit a 3-up grid.

Grids survive only where content is genuinely a flat set of equal peers with nothing more to say per item (industries-served list) — and even there, the unit changes from a bordered box to a plain image + label with a thin rule, not a card.

### What stays banned, explicitly

Everything DESIGN.md and the brief list — gradients, glassmorphism, glow, pill-everything, floating icons, oversized shadow — plus one addition specific to this codebase:

> **No new section may reuse the `rounded border border-border bg-surface p-{n}` class combination as its top-level container.** That exact string is the fingerprint of the current generic pattern; grepping for it after Phase 9B–D ships should return zero matches in `resources/js/pages/public` and `resources/js/components/public`.

---

## 6. Homepage Final Section-by-Section Plan

Base order per DESIGN.md — kept; the CMS-configurable section model (Phase 5) is sound and only needs new presentation, not a new shape.

### 1. Navbar
- **Purpose:** orientation + entry to the seven primary sections without competing with the hero.
- **Desktop:** logo left, 7 links centered-right, one primary CTA ("Contact" / "Get a Quote") right-aligned. 72px tall at rest.
- **Mobile:** logo + hamburger only; full-height drawer, links stacked left-aligned at H3 size, CTA pinned to drawer bottom.
- **Scroll state:** default `bg-surface` with 1px border-bottom; height compresses 72px→60px after 24px scroll, border-bottom opacity fades in from 0.
- **Motion:** height/shadow transition 200ms ease-out on scroll only — no entrance animation on load.

### 2. Hero
- **Purpose:** one visual statement — what Kenco makes and the confidence to say it plainly. Not a value-prop wall.
- **Desktop:** asymmetric 60/40 split — eyebrow + H1 + one-sentence description + two CTAs left (max-width ~34ch), one large manufacturing photograph filling the right 40%, full-bleed, no rounded corners. Height by content, target ~640–720px, never `100vh`.
- **Mobile:** image first (16:10, cropped to the most legible detail), headline block below on `bg-surface`, both CTAs full-width stacked.
- **Typography:** eyebrow = Caption, uppercase, tracked, `--muted`; headline = Display/H1 with `text-wrap: balance`; description = Body Large, max 2 lines.
- **Image treatment:** real production photography — a machine mid-cycle, tooling in focus, or an inspection moment. No overlay needed since no text sits on the image.
- **CTA:** primary solid ("View Capabilities"/"Explore Products"), secondary bordered ("Contact Us"). No third CTA.
- **Motion:** headline + CTAs fade/translate-up 12px over 500ms on load, staggered 80ms; image has no entrance animation (it's the LCP element).
- **Explicitly not:** no carousel, no rotating banner set, no animated background, no oversized illustration.

### 3. Company Introduction
- **Purpose:** establish who Kenco is in one breath before Capabilities.
- **Desktop:** editorial two-column — kicker + H2 + 2–3 sentence body in a 45%-width left column; one supporting image (facility exterior or team-at-work) in the right 55%, slightly larger than the text block.
- **Mobile:** stacked, text before image; body capped at 3 lines with a "Read our story →" link instead of the full paragraph repeated.
- **Background:** `bg-background` (off-white), thin top rule only — no boxed container.
- **Motion:** simple fade/translate-up on scroll-into-view, no stagger.

### 4. Key Metrics
- **Purpose:** credibility in numbers — years operating, floor space, machine count, on-time delivery rate. Whatever's true, never invented filler.
- **Desktop:** `MetricStrip` — 4 columns, full-bleed `bg-navy-900` band, each metric a large tabular-nums figure over a small caption label, divided by 1px vertical rules at 20% white opacity.
- **Mobile:** 2×2 grid, same band, rules become horizontal between rows.
- **Typography:** figure at H2 size in white; label at Caption size, 60%-opacity white, uppercase, tracked.
- **Motion:** optional count-up 0→value on first scroll-into-view, 900ms ease-out; `prefers-reduced-motion` shows the final value immediately.

### 5. Core Capabilities
- **Purpose:** manufacturing competency, not a SaaS feature grid.
- **Desktop:** `SectionHeader` (eyebrow "What We Do" + H2 + dek), then 2–3 `CapabilityFeature` rows stacked, alternating image-left/text-right and image-right/text-left. Each row: process photo, capability name, one-line summary, 2–3 spec chips (e.g. "±0.02mm tolerance"), "View Capability →" link. No grid, no card border.
- **Mobile:** image always first per row, full-width; alternation drops.
- **Image treatment:** 4:3 or 3:2 process photography, per-image object-position — never a generic icon standing in for the photo.
- **CTA:** per-row text link, plus one "View All Capabilities" at section end, right-aligned under the last row.
- **Motion:** each row fades/translates-up independently on viewport entry, 16px translate, 450ms.

### 6. Featured Products
- **Purpose:** proof of output — real parts, not a catalog upsell.
- **Desktop:** `ProductShowcase` 3-up, image-dominant (image:caption ≈ 80:20 of unit height), name + one material/spec line beneath in Caption size — no bordered card, 32px gutter instead of a border.
- **Mobile:** horizontal scroll-snap row at 78% viewport width each, so one is always partially visible as a scroll affordance.
- **Image treatment:** square or 4:5 close-up, consistent crop ratio across all three so the row reads as a set.
- **CTA:** whole unit links to the product; section-level "View All Products →" beneath.

### 7. Manufacturing Facilities
- **Purpose:** the single strongest visual proof point per the brief — must not be a photo gallery.
- **Desktop:** one large facility photograph (full-bleed within content width, 21:9) with a `FacilityFeature` spec panel overlaid bottom-left on a solid navy plate (not glass): facility name, location, floor area, then a 2-column spec row list of headline machines — name, brand/model, capacity. "View All Facilities →" bottom-right of the panel.
- **Mobile:** image on top (16:9), spec plate becomes a full-width solid block beneath rather than overlaid.
- **Content hierarchy:** photo → facility identity → machine specs → link. The one place a genuine spec table belongs on the homepage.
- **Motion:** none beyond standard scroll-reveal — this section should feel solid, not playful.

### 8. Quality & Certifications
- **Purpose:** formal, credible — closer to a compliance document than a marketing block.
- **Desktop:** left column — quality commitment statement (H2 + 2 sentences). Right column — a row of `CertificationItem` plates: certificate mark, standard name, issuing body, valid-until date, laid out like a document footer, divided by thin vertical rules, not boxed individually.
- **Mobile:** statement first, certifications become a horizontally scrollable single row of plates.
- **Explicitly not:** no product-card treatment — certificate marks sit on the page background, not inside individual bordered tiles.

### 9. Industries Served
- **Purpose:** breadth signal — quick scan, not deep content.
- **Desktop:** the one section where a flat equal-weight grid is honest to the content — 4–6 columns, each a square industry photo with the industry name as a caption beneath (no border, no background box).
- **Mobile:** 2 columns.
- **Motion:** simple stagger fade-in, 60ms between items, capped at 6 items animating.

### 10. Company Milestones / Experience
- **Purpose:** time-depth — the one place a numbered sequence is actually true to the content, since milestones are inherently chronological.
- **Desktop:** horizontal timeline — thin rule running the section width, year markers as ticks, labels alternating above/below to avoid stacked-text collision.
- **Mobile:** rotates to vertical — rule runs top-to-bottom on the left, entries stack right of it.
- **Motion:** rule draws left-to-right (or top-to-bottom on mobile) once on scroll-into-view, 700ms — the one deliberate "orchestrated" reveal, justified because it mirrors the content's own logic (time passing).

### 11. Latest News
- **Purpose:** signal the company is active, without competing with the manufacturing content above it.
- **Desktop:** 3 `ArticlePreview` units side by side — image on top (16:9), category kicker, headline (H4), date — gutter only, no card border, no background fill.
- **Mobile:** stacked single column.

### 12. Career CTA
- **Desktop:** full-width band, `bg-charcoal`, single-line H3 ("We're hiring — join our production team") + open-role count + one CTA button. No imagery — a text-forward interruption between content blocks.
- **Mobile:** same band, stacked, CTA full-width.

### 13. Contact CTA
- **Desktop:** `ContactCTA` split band — left H3 + short prompt + button, right a compact `ContactInfoPanel` (phone, email, one-line address) pulled live from Settings so this block never goes stale.
- **Mobile:** stacked, info panel becomes 3 tappable rows (tel:, mailto:, maps link).

### 14. Footer
- **Keep:** Phase 8's Settings-driven contact/social wiring is correct and carries forward unchanged into the new `PublicFooter` — only the visual container changes (structured columns with thin rules replacing the plain stack), not the data source.

---

## 7. Internal Public Pages Design Strategy

Every listing page gets a breadcrumb, a `SectionHeader` in place of its hand-rolled title band, and its card grid replaced per the table below. Detail pages gain the breadcrumb and start rendering fields that already exist but are unused.

| Page | Change |
|---|---|
| Products Index | Keep the category filter (works). Replace card grid with `ProductShowcase` units, 3-up. |
| Product Detail | Add breadcrumb (Products / Category / Name). Replace flat thumbnail grid with one large image + thumbnail rail. Add a "Related Capability" link where the category maps to one. |
| Capabilities Index | Replace grid with stacked `CapabilityFeature` rows (same component as homepage, full list). |
| Capability Detail | Render the hero image finally. Add breadcrumb. Keep the numbered process steps and equipment tags — both already correct. |
| Facilities Index | Full `FacilityFeature` treatment, one per facility, stacked — not a grid. Highest-priority visual rebuild among internal pages. |
| Quality Index | Split into labeled subsections (Commitment / Inspection / System / Continuous Improvement); each subsection uses the editorial split layout, not a stacked list of identical boxes. |
| Certifications | Full `CertificationItem` rebuild — document-plate layout, not cards. Group active vs. expired with a plain status label; never hide expired certs (existing rule, unchanged). |
| Industries | Keep as a grid (content is genuinely flat) but drop the card border — image + caption only, matching the homepage treatment. |
| News Index / Detail | `ArticlePreview` for the grid; detail adds breadcrumb and enlarges the featured image (full-bleed within content width). |
| Careers Index / Detail | Keep the list-row structure (already on-brand). Restyle rows to the new type scale, add breadcrumb on detail. |
| Contact | Rebuild as two columns: form left, `ContactInfoPanel` right (address/phone/email/hours from Settings + embedded map if `map_embed_url` is set). Data-wiring fix as much as visual. |

---

## 8. Responsive Strategy

| Breakpoint | Strategy |
|---|---|
| **Desktop (≥1024px)** | Full nav, asymmetric/editorial layouts as specified per section, large imagery, 12-column grid, 32px gutters, 96–120px section spacing. |
| **Tablet (768–1023px)** | Editorial splits collapse from side-by-side to stacked rather than shrinking columns; 3-up grids drop to 2-up; nav stays inline (overflow "More" if needed); 8-column grid, 24px gutters, 72–96px spacing. |
| **Mobile (<768px)** | Every editorial split becomes image-first, text-second (image carries recognition faster at this width). One column throughout. Drawer navigation. CTAs full-width, stacked, never side-by-side under ~380px. Facility/certification spec rows keep label/value structure but drop to single column. Metric strip 4-up→2×2. 4-column grid, 20px gutters, 56–72px spacing. |
| **Overflow discipline** | Only inherently wide tables/spec-lists (facility machine specs with many columns) get their own `overflow-x:auto` container — the page body itself never scrolls horizontally at any width, verified against a 400px floor. |

Mobile is not desktop shrunk: hero hierarchy, typography scale, imagery cropping, CTA usability, and navigation are each specified per breakpoint above, not derived by proportional scaling.

---

## 9. Typography System

Inter stays — already loaded, already matches the brand, explicitly recommended by DESIGN.md. The gap isn't the family; it's that the Tailwind scale stops at H4 while Body/Small/Caption are set ad hoc per file today. This finalizes all nine steps as real utilities.

| Token | Size / Weight / Line-height | Usage |
|---|---|---|
| Display | 64px / 700 / 1.05 | Hero headline (long form) |
| H1 | 52px / 700 / 1.1 | Page title |
| H2 | 40px / 700 / 1.15 | Section heading |
| H3 | 30px / 600 / 1.2 | Sub-section heading |
| H4 | 23px / 600 / 1.3 | Card/unit heading (e.g. article title) |
| Body Large | 18px / 400 / 1.6 | Hero descriptions, section deks |
| Body | 16px / 400 / 1.65 | Default running text |
| Small | 14px / 400 / 1.5 | Metadata, spec values, secondary detail |
| Caption | 12–13px / 500 / 1.4, tracked | Eyebrow / kicker / label, uppercase |

**Concrete change for Phase 9B:** add `fontSize.body-lg`, `fontSize.body`, `fontSize.small`, `fontSize.caption` to `tailwind.config.js` alongside the existing `display`/`h1`–`h4` entries, each with line-height baked in like the current ones — so every component pulls `text-body-lg` instead of a bare Tailwind size, and the scale becomes enforceable, not aspirational.

---

## 10. Color & Design Tokens

The existing foundation is correct and stays as the company's primary identity. This section fills the one real gap (`secondary`) and states usage rules so the palette doesn't drift as new components ship.

| Token | Value | Role |
|---|---|---|
| Navy 900 | `#0B1F33` | `primary` — solid buttons, dark bands |
| Navy 800 | `#12314D` | Hover state for primary |
| Navy 700 | `#17466B` | Accent / link color |
| Charcoal | `#1B1F23` | `foreground` — body text |
| Slate 700 | `#3E4852` | Secondary text |
| Slate 500 | `#687581` | `muted-foreground` |
| Gray 200 | `#D9DEE3` | `border` |
| Gray 100 | `#EEF1F3` | **New → `secondary`** (see below) |
| Off White | `#F8F9F7` | `background` |
| White | `#FFFFFF` | `surface` |
| Success | `#168447` | Status — published, active |
| Warning | `#B07606` | Status — draft, expiring |
| Danger | `#B22222` | Status — archived, error |

**Token addition — `secondary`:** new token mapping to Gray 100 (`#EEF1F3`) as background with Charcoal foreground. Used for spec-row zebra backgrounds, kicker chips, and the certificate-plate ground in `CertificationItem` — anywhere content needs a surface one step down from `surface` without reaching for `muted` (reserved for text).

**Usage rule:** no component may hardcode a hex or `rgb()` literal — already true today and must stay true as the ~9 new components ship.

---

## 11. Image Strategy

| Context | Ratio | Notes |
|---|---|---|
| Hero | 16:10 desktop, 4:5 mobile | Separate mobile source, not a scaled desktop crop; `object-position` tuned per image. |
| Capability / process | 4:3 or 3:2 | Landscape, cropped to keep the machine/hands-on-work detail centered — never a wide generic "factory" establishing shot. |
| Product | 1:1 or 4:5 | Consistent ratio within a grid so a row of 3 reads as a set. |
| Facility | 21:9 desktop, 16:9 mobile | Widest, highest-resolution photo on the site — it carries the spec panel. |
| Article | 16:9 | Consistent listing + detail for editorial rhythm. |

**Responsive delivery:** use the existing Media Library (Phase 8) — it already stores width/height per upload, so every image renders with correct `width`/`height` attributes to prevent layout shift; hero/facility images get `srcset` at 2–3 widths since they're the largest bytes-on-page.

**Loading:** hero image — eager + `fetchpriority="high"` (LCP candidate). Every other image below the fold — native `loading="lazy"`.

---

## 12. Motion Strategy

No animation library. A single small `useInView` hook (IntersectionObserver, ~30 lines) plus CSS transitions covers every case below — a performance requirement as much as a restraint one.

| Motion | Spec |
|---|---|
| Scroll reveal | Opacity 0→1 + translateY 12–16px→0, 400–600ms ease-out, triggered once at ~20% into viewport. Applied to section-level blocks, not individual words or icons. |
| Stagger | Only within genuine peers (industries grid, metric strip) — 60–80ms between items, capped so nothing past item 6 waits more than ~400ms. |
| Hover | Image scale 1→1.03 on hover, 300ms; text links get an underline transition, not color-only. |
| Counters | Metric strip only, 0→value over ~900ms ease-out, on first reveal. |
| Milestone timeline | The rule draws once on scroll-into-view — the one deliberate "orchestrated" moment, justified by content (time passing). |
| Reduced motion | `prefers-reduced-motion: reduce` disables all of the above — content renders at resting state immediately, no exceptions. |
| Explicitly avoided | Scroll-hijacking, parallax beyond plain background-attachment, cursor-follow effects, per-character text animation, anything looping indefinitely. |

---

## 13. Target Component Architecture

Target tree under `resources/js/components/public/`. Files not listed (`SeoHead`) are unchanged.

| Component | Owns |
|---|---|
| `PublicNavbar.tsx` | Logo, 7-item nav, scroll state, mobile drawer. Replaces the header block currently inline in `PublicLayout.tsx`. |
| `PublicFooter.tsx` | Settings-driven columns (unchanged data contract from Phase 8), structured with rules instead of a plain stack. |
| `SectionHeader.tsx` | Eyebrow + heading + description, optional align (left/center), optional trailing "View All" link slot. |
| `Breadcrumb.tsx` | Public variant of the admin breadcrumb — accepts `{label, href?}[]`, schema-ready markup. |
| `Hero.tsx` | Replaces SectionRenderer's inline hero case. Renders eyebrow/heading/description/CTAs and, finally, the image field. |
| `MetricStrip.tsx` | Stats section — tabular figures, optional count-up, dark band. |
| `CapabilityFeature.tsx` | Alternating image/text row with spec chips — homepage (top N) and Capabilities Index (full list). |
| `ProductShowcase.tsx` | Image-dominant product unit — homepage and Products Index. |
| `FacilityFeature.tsx` | Large photo + overlaid/stacked spec plate surfacing machine brand/model/capacity — homepage and Facilities Index. |
| `CertificationItem.tsx` | Document-plate certificate presentation — homepage's Quality band and the Certifications page. |
| `ArticlePreview.tsx` | Editorial news teaser — homepage and News Index. |
| `ContactInfoPanel.tsx` | Address/phone/email/hours/map, sourced from `siteSettings` — Contact and homepage's Contact CTA. |
| `ContactCTA.tsx` | Split band combining a prompt + button with a compact `ContactInfoPanel`. |
| `SectionRenderer.tsx` | *(refactored, not replaced)* — thin switch over `section_type` delegating to the components above. |

---

## 14. Phase 9B–9D Implementation Plan

### 9B — Foundation
Tailwind type-scale additions (§9). `secondary` token (§10). Build `PublicNavbar`, `PublicFooter`, `SectionHeader`, `Breadcrumb`, `Hero`, `MetricStrip`, the `useInView` motion hook. Rebuild the homepage end to end using them. This phase alone fixes the most visible page.

### 9C — Collections & detail pages
Build `CapabilityFeature`, `ProductShowcase`, `FacilityFeature`, `CertificationItem`, `ArticlePreview`. Rebuild Products, Capabilities, Facilities, Quality, Certifications, Industries (index + detail) to consume them. Add breadcrumbs across every detail page. This is where the machine-spec and certificate-plate fixes land.

### 9D — News, Career, Contact, polish pass
Build `ContactInfoPanel` / `ContactCTA`, wire Contact page to Settings. Restyle News and Careers to the finished type scale (structure mostly kept). Full motion pass (§12) applied sitewide. Close with a Core Web Vitals check (LCP on the new hero images, CLS on the now-dimensioned Media Library images) and a heading-hierarchy/schema audit.

---

## 15. Expected Files / Components to Change

No file below is touched in Phase 9A. Listed for 9B–D scoping.

### New

```
resources/js/components/public/PublicNavbar.tsx
resources/js/components/public/PublicFooter.tsx
resources/js/components/public/SectionHeader.tsx
resources/js/components/public/Breadcrumb.tsx
resources/js/components/public/Hero.tsx
resources/js/components/public/MetricStrip.tsx
resources/js/components/public/CapabilityFeature.tsx
resources/js/components/public/ProductShowcase.tsx
resources/js/components/public/FacilityFeature.tsx
resources/js/components/public/CertificationItem.tsx
resources/js/components/public/ArticlePreview.tsx
resources/js/components/public/ContactInfoPanel.tsx
resources/js/components/public/ContactCTA.tsx
resources/js/hooks/use-in-view.ts
```

### Refactored

```
resources/js/layouts/PublicLayout.tsx        — becomes a thin shell composing Navbar + Footer
resources/js/components/public/SectionRenderer.tsx  — dispatcher only
resources/js/pages/public/Home.tsx
resources/js/pages/public/products/{Index,Show}.tsx
resources/js/pages/public/capabilities/{Index,Show}.tsx
resources/js/pages/public/facilities/Index.tsx
resources/js/pages/public/quality/Index.tsx
resources/js/pages/public/certifications/Index.tsx
resources/js/pages/public/industries/Index.tsx
resources/js/pages/public/news/{Index,Show}.tsx
resources/js/pages/public/careers/{Index,Show}.tsx
resources/js/pages/public/contact/Index.tsx
resources/js/pages/public/Page.tsx           — minor, benefits automatically via SectionRenderer
```

### Config

```
tailwind.config.js     — body-lg/body/small/caption font sizes
resources/css/app.css  — --secondary token
```

### Unaffected

```
All of app/Http/Controllers, app/Actions, app/Services, app/Models
All of resources/js/pages/admin, resources/js/components/admin
resources/js/components/ui/button.tsx, components/public/SeoHead.tsx
```

**This phase (9A) changes none of the above.** Approval gates 9B; 9B's homepage rebuild is the natural checkpoint before 9C touches the six collection pages.
