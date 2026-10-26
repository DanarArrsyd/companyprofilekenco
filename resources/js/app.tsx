import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

import { registerAutoTranslateHeader } from '@/lib/auto-translate';
import { bootPageLoader, registerPageLoader } from '@/lib/page-loader';

const appName = 'PT Kenco Manufactur Indonesia';

registerAutoTranslateHeader(router);
registerPageLoader(router);

const normalizeName = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const sameName = (title: string, name: string) => normalizeName(title).endsWith(normalizeName(name));

createInertiaApp({
    // Public pages resolve their own full title (via SeoService, including
    // the company name and an admin-configurable separator) — only suffix
    // here when the resolved title doesn't already end with it, so admin
    // pages (which pass a bare title) keep their existing "Title - App"
    // behavior without public pages ending up with the company name twice.
    // Compare without punctuation/case so a minor difference in the configured
    // company name cannot append the same title suffix twice.
    title: (title) => (sameName(title, appName) ? title : `${title} - ${appName}`),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
        bootPageLoader();
    },
    progress: {
        color: '#4B5563',
    },
});
