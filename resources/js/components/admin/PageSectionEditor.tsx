import { router, useForm } from '@inertiajs/react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { LocaleBadge } from '@/components/admin/ContentLocaleTabs';
import { PickerOption, SectionContentFields } from '@/components/admin/SectionContentFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { initialTranslations, translatableBinder } from '@/lib/translatable-form';
import type { ContentLocale, TranslationValues } from '@/lib/translatable-form';
import { PageSection } from '@/types/cms';

// Section content shape varies per section_type, so it is kept loosely typed here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SectionContent = Record<string, any>;

export function PageSectionEditor({
    pageId,
    section,
    isFirst,
    isLast,
    onMove,
    pickerOptions,
    fixed = false,
    label,
    locale = 'en',
}: {
    pageId: number;
    section: PageSection;
    isFirst: boolean;
    isLast: boolean;
    onMove: (direction: 'up' | 'down') => void;
    pickerOptions?: { capabilities?: PickerOption[]; products?: PickerOption[]; facilities?: PickerOption[] };
    fixed?: boolean;
    label?: string;
    /** Active content tab shared by every section on the page. */
    locale?: ContentLocale;
}) {
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const { data, setData, put, processing, isDirty, wasSuccessful, errors, setDefaults } = useForm<{
        section_type: string;
        title: string;
        subtitle: string;
        content: SectionContent;
        is_active: boolean;
        translations: { id: TranslationValues };
    }>({
        section_type: section.section_type,
        title: section.title ?? '',
        subtitle: section.subtitle ?? '',
        content: (section.content ?? {}) as SectionContent,
        is_active: section.is_active,
        translations: initialTranslations(section, ['title', 'subtitle']),
    });
    const bind = translatableBinder(data, setData, locale);

    const save = () => {
        put(route('admin.pages.sections.update', [pageId, section.id]), {
            preserveScroll: true,
            onSuccess: () => setDefaults(),
        });
    };

    const saveError = Object.values(errors)[0];

    return (
        <div className="rounded-lg border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-6 py-4 sm:px-8">
                <div className="flex items-center gap-2">
                    <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium uppercase text-slate-700">
                        {label ?? section.section_type.replace('_', ' ')}
                    </span>
                    {!data.is_active && (
                        <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">Inactive</span>
                    )}
                </div>

                {!fixed && (
                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={isFirst}
                            onClick={() => onMove('up')}
                            aria-label="Move section up"
                        >
                            <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={isLast}
                            onClick={() => onMove('down')}
                            aria-label="Move section down"
                        >
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => setConfirmingDelete(true)}
                            aria-label="Delete section"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            <div className="space-y-5 p-6 sm:p-8">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                        <Label htmlFor={`title-${section.id}`}>Title<LocaleBadge locale={locale} /></Label>
                        <Input id={`title-${section.id}`} {...bind('title')} className="mt-1.5" />
                    </div>
                    <div>
                        <Label htmlFor={`subtitle-${section.id}`}>Subtitle<LocaleBadge locale={locale} /></Label>
                        <Input id={`subtitle-${section.id}`} {...bind('subtitle')} className="mt-1.5" />
                    </div>
                </div>

                <SectionContentFields
                    sectionType={data.section_type}
                    content={data.content}
                    onChange={(content) => setData('content', content as SectionContent)}
                    pickerOptions={pickerOptions}
                    locale={locale}
                />

                <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="rounded border-border"
                        />
                        Active (visible on the public page)
                    </label>

                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <span className={`text-xs ${saveError ? 'text-danger' : isDirty ? 'text-warning' : wasSuccessful ? 'text-success' : 'text-slate-500'}`}>
                            {saveError
                                ? saveError
                                : processing
                                    ? 'Saving…'
                                    : isDirty
                                        ? 'Unsaved changes'
                                        : wasSuccessful
                                            ? 'Saved'
                                            : 'No pending changes'}
                        </span>
                        <Button type="button" size="sm" onClick={save} disabled={processing || !isDirty}>
                            {processing ? 'Saving…' : 'Save Section'}
                        </Button>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={confirmingDelete}
                title="Remove this section?"
                description="This section will be permanently removed from the page."
                confirmLabel="Remove"
                destructive
                onCancel={() => setConfirmingDelete(false)}
                onConfirm={() => {
                    router.delete(route('admin.pages.sections.destroy', [pageId, section.id]), { preserveScroll: true });
                    setConfirmingDelete(false);
                }}
            />
        </div>
    );
}
