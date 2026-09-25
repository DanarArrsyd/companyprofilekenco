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
    // Reveal classes are assembled at runtime by revealClass(). Keep every
    // variant in production CSS instead of relying on source extraction.
    safelist: [
        'scroll-reveal--up',
        'scroll-reveal--left',
        'scroll-reveal--right',
        'scroll-reveal--scale',
        'scroll-reveal--fade',
        'scroll-reveal--image',
        'scroll-reveal--image-left',
        'scroll-reveal--image-right',
    ],

    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: '1.25rem',
                sm: '1.5rem',
                lg: '2rem',
            },
        },
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
                caveat: ['Caveat', 'cursive'],
                montserrat: ['Montserrat', 'Inter', ...defaultTheme.fontFamily.sans],
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
                    950: 'rgb(var(--color-navy-950) / <alpha-value>)',
                    900: 'rgb(var(--color-navy-900) / <alpha-value>)',
                    800: 'rgb(var(--color-navy-800) / <alpha-value>)',
                    700: 'rgb(var(--color-navy-700) / <alpha-value>)',
                },
                charcoal: 'rgb(var(--color-charcoal) / <alpha-value>)',
                gray: {
                    200: 'rgb(var(--color-gray-200) / <alpha-value>)',
                    100: 'rgb(var(--color-gray-100) / <alpha-value>)',
                },
                slate: {
                    700: 'rgb(var(--color-slate-700) / <alpha-value>)',
                    500: 'rgb(var(--color-slate-500) / <alpha-value>)',
                },
            },
            maxWidth: {
                content: '80rem',
                wide: '90rem',
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
                'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
                body: ['1rem', { lineHeight: '1.65', fontWeight: '400' }],
                small: ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
                caption: ['0.78125rem', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.06em' }],
            },
            borderRadius: {
                DEFAULT: '0.375rem',
            },
        },
    },

    plugins: [forms],
};
