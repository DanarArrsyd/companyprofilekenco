import { Wand2 } from 'lucide-react';

import { FieldHint } from '@/components/admin/FieldHint';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { slugify, tidySlugInput } from '@/lib/slug';

/**
 * Editable slug with the public address prefix and a "Generate from title"
 * button (from the English title — slugs are shared by both languages).
 */
export function SlugField({
    value,
    onChange,
    source,
    prefix,
    hint,
    error,
}: {
    value: string;
    onChange: (slug: string) => void;
    /** English title or name the slug can be generated from. */
    source: string;
    /** Public address before the slug, e.g. "/products/"; omit when the slug is not part of a page address. */
    prefix?: string;
    hint: string;
    error?: string;
}) {
    return (
        <div>
            <Label htmlFor="slug">Slug</Label>
            <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
                <div className="flex h-11 min-w-0 flex-1 items-center rounded border border-border bg-surface focus-within:ring-2 focus-within:ring-primary">
                    {prefix && <span className="select-none whitespace-nowrap pl-3 text-sm text-slate-500">{prefix}</span>}
                    <input
                        id="slug"
                        value={value}
                        onChange={(e) => onChange(tidySlugInput(e.target.value))}
                        onBlur={() => onChange(slugify(value))}
                        spellCheck={false}
                        autoComplete="off"
                        aria-describedby="slug-help"
                        className={`h-full min-w-0 flex-1 border-0 bg-transparent pr-3 text-sm text-foreground focus:outline-none focus:ring-0 ${prefix ? 'pl-0.5' : 'pl-3'}`}
                    />
                </div>
                <Button type="button" variant="secondary" onClick={() => onChange(slugify(source))} disabled={slugify(source) === '' || slugify(source) === value}>
                    <Wand2 className="mr-2 h-4 w-4" aria-hidden="true" />
                    Generate from title
                </Button>
            </div>
            <FieldHint id="slug-help">{hint}</FieldHint>
            {error && <p className="mt-1 text-sm text-danger">{error}</p>}
        </div>
    );
}
