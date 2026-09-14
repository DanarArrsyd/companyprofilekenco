import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
    id: number;
    variant: ToastVariant;
    message: string;
}

interface ToastContextValue {
    toasts: ToastItem[];
    toast: (variant: ToastVariant, message: string) => void;
    dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const dismiss = useCallback((id: number) => {
        setToasts((current) => current.filter((item) => item.id !== id));
    }, []);

    const toast = useCallback(
        (variant: ToastVariant, message: string) => {
            const id = nextId++;
            setToasts((current) => [...current, { id, variant, message }]);
            window.setTimeout(() => dismiss(id), 5000);
        },
        [dismiss],
    );

    return (
        <ToastContext.Provider value={{ toasts, toast, dismiss }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }

    return context;
}
