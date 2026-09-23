export interface TextSectionPresentation {
    body: string | null;
    image: string | null;
    variant: 'standard' | 'taped_image';
}

function nonEmptyString(value: unknown): string | null {
    if (typeof value !== 'string') return null;

    const normalized = value.trim();

    return normalized === '' ? null : normalized;
}

export function getTextSectionPresentation(
    content: Record<string, unknown>,
    settings: Record<string, unknown> | null,
): TextSectionPresentation {
    const body = nonEmptyString(content.body);
    const image = nonEmptyString(content.image);

    return {
        body,
        image,
        variant: settings?.layout === 'taped_image' && image ? 'taped_image' : 'standard',
    };
}
