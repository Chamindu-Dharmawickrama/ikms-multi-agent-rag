import { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface ToastProps {
    message: string;
    type: "success" | "error";
    onClose: () => void;
    duration?: number;
}

export const Toast = ({
    message,
    type,
    onClose,
    duration = 5000,
}: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 min-w-[300px] max-w-[500px] px-4 py-3 rounded-lg shadow-xl border animate-slideIn ${
                type === "success"
                    ? "bg-gray-800 border-blue-500/50 text-white"
                    : "bg-gray-800 border-red-500/50 text-white"
            }`}
        >
            <div className="flex-shrink-0">
                {type === "success" ? (
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                )}
            </div>
            <div className="flex-1 text-sm font-medium">{message}</div>
            <button
                onClick={onClose}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

interface ToastContainerProps {
    toasts: Array<{ id: string; message: string; type: "success" | "error" }>;
    onRemove: (id: string) => void;
}

export const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
    return (
        <>
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => onRemove(toast.id)}
                />
            ))}
        </>
    );
};
