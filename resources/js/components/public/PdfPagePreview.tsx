import { useEffect, useRef, useState, type ReactNode } from 'react';

import { useLocale } from '@/hooks/use-locale';
// The hosting layer serves .mjs as text/plain; Vite bundles this worker as .js.
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?worker&url';

let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null;

function loadPdfjs() {
    pdfjsPromise ??= import('pdfjs-dist').then((pdfjs) => {
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
        return pdfjs;
    });

    return pdfjsPromise;
}

/** Renders page one only, when the document enters the viewport. */
export function PdfPagePreview({ url, name, fallback }: { url: string; name: string; fallback: ReactNode }) {
    const { t } = useLocale();
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [visible, setVisible] = useState(false);
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        if (!('IntersectionObserver' in window)) {
            setVisible(true);
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisible(true);
                observer.disconnect();
            }
        }, { rootMargin: '300px' });

        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!visible) return;

        let cancelled = false;
        let loadingTask: import('pdfjs-dist').PDFDocumentLoadingTask | null = null;
        let renderTask: import('pdfjs-dist').RenderTask | null = null;
        setStatus('loading');

        void (async () => {
            const pdfjs = await loadPdfjs();
            if (cancelled) return;

            loadingTask = pdfjs.getDocument({ url });
            const document = await loadingTask.promise;
            const page = await document.getPage(1);
            if (cancelled) return;

            const canvas = canvasRef.current;
            const context = canvas?.getContext('2d', { alpha: false });
            if (!canvas || !context) throw new Error('PDF canvas unavailable');

            const viewport = page.getViewport({ scale: 1.2 });
            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);
            renderTask = page.render({ canvas, canvasContext: context, viewport });
            await renderTask.promise;
            if (!cancelled) setStatus('ready');
        })().catch(() => {
            if (!cancelled) setStatus('error');
        });

        return () => {
            cancelled = true;
            renderTask?.cancel();
            void loadingTask?.destroy();
        };
    }, [url, visible]);

    return (
        <div ref={containerRef} role="img" aria-label={t('PDF preview of :name', { name })} className="flex h-full w-full items-center justify-center overflow-hidden">
            {status === 'loading' && <span className="text-caption font-semibold uppercase tracking-[0.12em] text-muted-foreground">{t('Loading PDF preview')}</span>}
            {status === 'error' ? fallback : <canvas ref={canvasRef} aria-hidden="true" className={status === 'ready' ? 'block max-h-full max-w-full border border-border' : 'hidden'} />}
        </div>
    );
}
