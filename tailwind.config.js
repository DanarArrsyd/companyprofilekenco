import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{ts,tsx}',
    ],

    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: '20px',
                sm: '24px',
                lg: '32px',
            },
        },
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                caveat: ['Caveat', 'cursive'],
            },
            colors: {
                background: 'rgb(var(--background) / <alpha-value>)',
                foreground: 'rgb(var(--foreground) / <alpha-value>)',
                surface: 'rgb(var(--surface) / <alpha-value>)',
                primary: {
                    DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
                    foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
                },
                muted: {
                    DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
                    foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
                },
                secondary: {
                    DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
                    foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
                },
                border: 'rgb(var(--border) / <alpha-value>)',
                success: 'rgb(var(--color-success) / <alpha-value>)',
                warning: 'rgb(var(--color-warning) / <alpha-value>)',
                danger: 'rgb(var(--color-danger) / <alpha-value>)',
                navy: {
                    900: 'rgb(var(--color-navy-900) / <alpha-value>)',
                    800: 'rgb(var(--color-navy-800) / <alpha-value>)',
                    700: 'rgb(var(--color-navy-700) / <alpha-value>)',
                },
                charcoal: 'rgb(var(--color-charcoal) / <alpha-value>)',
                slate: {
                    700: 'rgb(var(--color-slate-700) / <alpha-value>)',
                    500: 'rgb(var(--color-slate-500) / <alpha-value>)',
                },
            },
            maxWidth: {
                content: '1280px',
                wide: '1440px',
            },
            fontSize: {
                // Fluid via clamp(min, preferred, max): scales down smoothly on
                // narrow viewports instead of holding a fixed desktop-sized px
                // value everywhere it's used — the `max` here is the original
                // fixed size, so desktop (~1100px+ viewport) is unchanged.
                display: ['clamp(2.25rem, 1.25rem + 5vw, 4rem)', { lineHeight: '1.05', fontWeight: '700' }],
                h1: ['clamp(1.75rem, 1rem + 4vw, 3.25rem)', { lineHeight: '1.15', fontWeight: '700' }],
                h2: ['clamp(1.5rem, 0.9rem + 3.2vw, 2.5rem)', { lineHeight: '1.2', fontWeight: '700' }],
                h3: ['clamp(1.25rem, 0.85rem + 2.2vw, 1.875rem)', { lineHeight: '1.25', fontWeight: '600' }],
                h4: ['clamp(1.125rem, 0.85rem + 1.4vw, 1.4375rem)', { lineHeight: '1.35', fontWeight: '600' }],
                'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
                body: ['16px', { lineHeight: '1.65', fontWeight: '400' }],
                small: ['14px', { lineHeight: '1.5', fontWeight: '400' }],
                caption: ['12.5px', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.06em' }],
            },
            borderRadius: {
                DEFAULT: '6px',
            },
        },
    },

    plugins: [forms],
};
