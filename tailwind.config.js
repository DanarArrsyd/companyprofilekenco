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
                display: ['64px', { lineHeight: '1.05', fontWeight: '700' }],
                h1: ['52px', { lineHeight: '1.1', fontWeight: '700' }],
                h2: ['40px', { lineHeight: '1.15', fontWeight: '700' }],
                h3: ['30px', { lineHeight: '1.2', fontWeight: '600' }],
                h4: ['23px', { lineHeight: '1.3', fontWeight: '600' }],
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
