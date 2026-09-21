import { Breadcrumb, BreadcrumbItem } from '@/components/public/Breadcrumb';
import { ImagePlaceholder } from '@/components/public/ImagePlaceholder';
import { SeoHead } from '@/components/public/SeoHead';
import PublicLayout from '@/layouts/PublicLayout';
import { ResolvedSeo } from '@/types/cms';

interface Step {
    id: number; title: string; description: string | null;
}

interface Machine {
    id: number; name: string; brand: string | null; model: string | null;
    capacity: string | null; quantity: number | null;
}

interface Capability {
    id: number; name: string; summary: string | null; description: string | null;
    featured_image: string | null; steps: Step[]; machines: Machine[];
}

export default function Show({
    capability, seo, breadcrumb, schema, preview,
}: {
    capability: Capability;
    seo: ResolvedSeo;
    breadcrumb: BreadcrumbItem[];
    schema?: Array<Record<string, unknown> | null>;
    preview: boolean;
}) {
    return (
        <PublicLayout>
            <SeoHead seo={seo} schema={schema} />

            {preview && (
                <div className="bg-warning/10 px-5 py-2 text-center text-sm font-medium text-warning">
                    Draft preview — this capability is not publicly visible.
                </div>
            )}

            <div className="mx-auto max-w-content px-5 py-12 sm:px-6 lg:px-8">
                <Breadcrumb items={breadcrumb} />

                <div className="mt-8 grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
                    <div data-reveal="left">
                        <h1 className="text-h1 text-navy-900" style={{ textWrap: 'balance' }}>{capability.name}</h1>
                        {capability.summary && <p className="mt-4 text-body-lg text-slate-700">{capability.summary}</p>}
                        {capability.description && <p className="mt-6 text-body text-slate-700">{capability.description}</p>}
                    </div>
                    <div data-reveal="right" className="aspect-[4/3] w-full bg-muted">
                        {capability.featured_image ? (
                            <img src={`/storage/${capability.featured_image}`} alt={capability.name} className="h-full w-full object-cover" loading="eager" />
                        ) : (
                            <ImagePlaceholder />
                        )}
                    </div>
                </div>

                {capability.steps.length > 0 && (
                    <div className="mt-16 border-t border-border pt-12">
                        <h2 className="text-h3 text-navy-900">Process</h2>
                        <ol data-reveal-group className="mt-6 space-y-6">
                            {capability.steps.map((step, index) => (
                                <li key={step.id} className="flex gap-5">
                                    <span className="text-caption font-semibold text-muted-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <div>
                                        <p className="font-medium text-foreground">{step.title}</p>
                                        {step.description && <p className="mt-1 text-small text-muted-foreground">{step.description}</p>}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {capability.machines.length > 0 && (
                    <div className="mt-16 border-t border-border pt-12">
                        <h2 className="text-h3 text-navy-900">Equipment</h2>
                        <dl data-reveal-group className="mt-6 divide-y divide-border">
                            {capability.machines.map((machine) => (
                                <div key={machine.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                                    <dt className="text-small text-foreground">
                                        {machine.name}
                                        {(machine.brand || machine.model) && (
                                            <span className="text-muted-foreground"> — {[machine.brand, machine.model].filter(Boolean).join(' ')}</span>
                                        )}
                                    </dt>
                                    <dd className="text-small text-muted-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                        {[machine.capacity, machine.quantity ? `×${machine.quantity}` : null].filter(Boolean).join(' · ') || '—'}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
