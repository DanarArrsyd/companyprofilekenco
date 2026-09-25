import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Teach tailwind-merge the custom type scale from tailwind.config.js. Without
// it `text-small` / `text-h2` are read as text colours, so `cn('text-small
// text-white')` would silently drop one of them.
const twMerge = extendTailwindMerge({
    extend: {
        classGroups: {
            'font-size': [{ text: ['display', 'h1', 'h2', 'h3', 'h4', 'body-lg', 'body', 'small', 'caption'] }],
        },
    },
});

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
