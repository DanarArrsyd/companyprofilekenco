import assert from 'node:assert/strict';
import test from 'node:test';

type TextSectionPresentationModule = {
    getTextSectionPresentation: (
        content: Record<string, unknown>,
        settings: Record<string, unknown> | null,
    ) => {
        body: string | null;
        image: string | null;
        variant: 'standard' | 'taped_image';
    };
};

async function loadPresentationModule(): Promise<TextSectionPresentationModule | null> {
    try {
        return await import('../../resources/js/components/public/text-section-presentation.ts');
    } catch (error) {
        if (error instanceof Error && error.code === 'ERR_MODULE_NOT_FOUND') return null;
        throw error;
    }
}

test('uses taped image layout for an opted-in text section with an image', async () => {
    const module = await loadPresentationModule();

    assert.ok(module, 'text section presentation module must exist');
    assert.deepEqual(
        module.getTextSectionPresentation(
            { body: 'Manufacturing partner.', image: 'library/company.jpg' },
            { layout: 'taped_image' },
        ),
        {
            body: 'Manufacturing partner.',
            image: 'library/company.jpg',
            variant: 'taped_image',
        },
    );
});

test('falls back to standard layout when taped image section has no usable image', async () => {
    const module = await loadPresentationModule();

    assert.ok(module, 'text section presentation module must exist');
    assert.deepEqual(
        module.getTextSectionPresentation({ body: 'Manufacturing partner.', image: '   ' }, { layout: 'taped_image' }),
        {
            body: 'Manufacturing partner.',
            image: null,
            variant: 'standard',
        },
    );
});
