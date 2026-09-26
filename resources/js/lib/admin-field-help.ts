/*
 * Admin form guidance in one place: a hint shown under the field and an
 * example used as the placeholder. `module:field` entries (module = the
 * pages/admin folder) override the shared `field` entry. Keep hints true to
 * what the site does with the value — check the public controller first.
 */

export interface FieldHelp {
    hint?: string;
    example?: string;
}

const SHARED: Record<string, FieldHelp> = {
    slug: {
        hint: 'The page address. Leave empty to build it from the name. Lowercase letters, numbers and hyphens only; you can change it later on the edit page.',
        example: 'progressive-die-stamping',
    },
    status: {
        hint: 'Draft: only admins can see it. Published: live on the site from the publish time. Archived: hidden but kept.',
    },
    published_at: {
        hint: 'Your local time. Leave empty to go live as soon as you save it as Published; pick a future time to schedule it.',
    },
    sort_order: { hint: 'Lower numbers are shown first (0, 1, 2 …).', example: '0' },
    name: { example: 'Metal Stamping' },
    title: { example: 'New press line starts production' },
    summary: { hint: 'One or two sentences shown on cards and listings.', example: 'High-volume progressive die stamping for automotive brackets.' },
};

const MODULES: Record<string, FieldHelp> = {
    'capabilities:name': { example: 'Metal Stamping' },
    'capabilities:icon': { hint: 'Optional. Not shown on the public site at the moment.', example: 'factory' },
    'capabilities:is_featured': { hint: 'Marks the capability internally; the homepage shows the capabilities picked in Homepage → Capabilities.' },

    'products:name': { example: 'Engine Mounting Bracket' },
    'products:short_description': { hint: 'One line shown on product cards (max 255 characters).', example: 'Stamped steel bracket for engine mounts.' },
    'products:material': { hint: 'Separate several materials with commas.', example: 'SPCC, SPHC, SUS 304' },
    'products:application': { example: 'Automotive chassis, two-wheelers' },
    'products:manufacturing_process': { example: 'Progressive die stamping, spot welding, e-coating' },
    'products:product_category_id': { hint: 'Used for the category filter on the Products page.' },
    'products:is_featured': { hint: 'Featured products are listed first on the Products page.' },

    'news:title': { example: 'Kenco commissions a new 400-ton press line' },
    'news:excerpt': { hint: 'One or two sentences shown on news cards and in search results.', example: 'The new line doubles our stamping capacity for automotive parts.' },
    'news:news_category_id': { hint: 'Optional. Used to group articles.' },
    'news:is_featured': { hint: 'The newest featured article is shown as the headline on the News page.' },

    'careers:title': { example: 'Production Supervisor' },
    'careers:department': { example: 'Production' },
    'careers:location': { example: 'Bekasi, West Java' },
    'careers:employment_type': { example: 'Full-time' },
    'careers:description': { hint: 'What the role does. Line breaks are kept.' },
    'careers:requirements': { hint: 'One requirement per line; line breaks are kept on the job page.', example: 'Minimum D3 in Mechanical Engineering\n2 years in a stamping plant' },
    'careers:closes_at': { hint: 'Your local time. Optional; leave empty if applications stay open.' },

    'certifications:name': { example: 'ISO 9001:2015' },
    'certifications:issuer': { example: 'TÜV Rheinland' },
    'certifications:certificate_number': { example: 'QMS-12345/2024' },
    'certifications:issued_at': { hint: 'Date on the certificate.' },
    'certifications:expires_at': { hint: 'Leave empty if the certificate does not expire.' },

    'facilities:name': { example: 'Plant 1 — Stamping' },
    'facilities:location': { example: 'Jl. Industri Raya No. 1, Bekasi' },
    'facilities:facility_category_id': { hint: 'Optional. Shown as a small label on the facility card on the Company page.' },

    'facility-categories:name': { example: 'Production Plant' },
    'product-categories:name': { example: 'Brackets' },
    'news-categories:name': { example: 'Company News' },

    'industries:name': { example: 'Automotive' },

    'machines:name': { example: 'Progressive Press' },
    'machines:brand': { example: 'Amada' },
    'machines:model': { example: 'TP-400' },
    'machines:capacity': { hint: 'Shown next to the machine on the site, with the quantity.', example: '400 ton' },
    'machines:quantity': { hint: 'How many units of this machine you run.', example: '2' },
    'machines:specification': { hint: 'Technical details, one per line.', example: 'Bed size: 2,500 × 1,200 mm\nStroke: 250 mm' },
    'machines:facility_id': { hint: 'The facility that runs this machine. Only published facilities are listed.' },

    'milestones:year': { hint: 'Four-digit year. The timeline is sorted by year.', example: '2017' },
    'milestones:title': { example: 'Company founded' },
    'milestones:order': { hint: 'Only matters when two milestones share a year: lower numbers come first.', example: '0' },

    'pages:title': { example: 'About Us' },

    'quality-content:title': { example: 'Quality Control Process' },
    'quality-content:summary': { hint: 'One or two sentences shown on the Quality page.', example: 'Every batch is measured against the customer drawing before shipping.' },

    'settings:company_name': { example: 'Kenco Manufacturing' },
    'settings:legal_name': { hint: 'Registered company name, kept for reference. Not shown on the public site yet.', example: 'PT. Kenco Manufactur Indonesia' },
    'settings:tagline': { example: 'Dies, Jigs & Parts Manufacturing' },
    'settings:email': { example: 'sales@kencomanufactur.co.id' },
    'settings:phone': { hint: 'Include the country code so it can be dialled from a phone.', example: '+62 21 1234 5678' },
    'settings:address': { hint: 'Line breaks are kept.' },
    'settings:operating_hours': { example: 'Mon–Fri 08:00–17:00' },
    'settings:map_embed_url': {
        hint: 'In Google Maps: Share → Embed a map → copy only the https://… link inside src="…". Other links are shown as a "view map" link instead of a map.',
        example: 'https://www.google.com/maps/embed?pb=…',
    },
    'settings:social_linkedin': { example: 'https://www.linkedin.com/company/…' },
    'settings:social_instagram': { example: 'https://www.instagram.com/…' },
    'settings:social_youtube': { example: 'https://www.youtube.com/@…' },
    'settings:seo_twitter_username': { example: '@kenco' },

    'users:name': { example: 'Budi Santoso' },
    'users:email': { hint: 'Used to sign in.', example: 'budi@kencomanufactur.co.id' },
    'roles:name': { example: 'Content Editor' },
};

export function fieldHelp(module: string, field: string): FieldHelp {
    return { ...SHARED[field], ...MODULES[`${module}:${field}`] };
}
