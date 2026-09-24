/**
 * Builds JSON-LD `<script>` elements from one or more schema objects.
 *
 * Must be called as a plain function inside <SeoHead>'s <Head> children
 * (e.g. `{jsonLdScripts(schema)}`), never rendered as `<JsonLd .../>` — the
 * Inertia <Head> component inspects its children's element `type` directly
 * (it never actually invokes function components), so a custom component
 * child would serialize to garbage instead of a real <script> tag.
 *
 * Every schema object passed in must already be built from real, resolved
 * entity/site data — callers (page components) are responsible for never
 * passing invented fields. `null`/`undefined` entries are skipped so a page
 * can conditionally build a schema (e.g. no BreadcrumbList) without extra
 * branching.
 */
export function jsonLdScripts(
    schema: Record<string, unknown> | Array<Record<string, unknown> | null | undefined> | null | undefined,
) {
    const items = (Array.isArray(schema) ? schema : [schema]).filter(Boolean) as Record<string, unknown>[];

    return items.map((item, index) => (
        <script
            key={index}
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, '\\u003c') }}
        />
    ));
}
