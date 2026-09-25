import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

import { registerAutoTranslateHeader } from '@/lib/auto-translate';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

registerAutoTranslateHeader(router);

createInertiaApp({
    // Public pages resolve their own full title (via SeoService, including
    // the company name and an admin-configurable separator) — only suffix
    // here when the resolved title doesn't already end with it, so admin
    // pages (which pass a bare title) keep their existing "Title - App"
    // behavior without public pages ending up with the company name twice.
    title: (title) => (title.endsWith(appName) ? title : `${title} - ${appName}`),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
