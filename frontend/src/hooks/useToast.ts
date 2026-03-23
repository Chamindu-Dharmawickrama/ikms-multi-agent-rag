import { useState, useCallback } from "react";

interface Toast {
    id: string;
    message: string;
    type: "success" | "error";
}

export const useToast = () => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback(
        (message: string, type: "success" | "error") => {
            const id = Math.random().toString(36).substring(7);
            setToasts((prev) => [...prev, { id, message, type }]);
        },
        [],
    );

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const toast = {
        success: (message: string) => addToast(message, "success"),
        error: (message: string) => addToast(message, "error"),
    };

    return { toasts, removeToast, toast };
};
