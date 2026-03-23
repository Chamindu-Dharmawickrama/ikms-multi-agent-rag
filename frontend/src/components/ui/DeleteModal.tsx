import { AlertTriangle, X } from "lucide-react";

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description?: string;
    itemName?: string;
    isLoading?: boolean;
}

const DeleteModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    itemName,
    isLoading = false,
}: DeleteModalProps) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-[340px] sm:max-w-md mx-auto rounded-xl sm:rounded-2xl bg-gray-800 p-4 sm:p-6 shadow-2xl border border-gray-700 animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1 sm:p-0 text-gray-400 hover:text-white active:text-white transition-colors touch-manipulation"
                    aria-label="Close"
                    disabled={isLoading}
                >
                    <X className="w-5 h-5 sm:w-5 sm:h-5" />
                </button>

                <div className="flex items-center justify-center mb-3 sm:mb-4 mt-2 sm:mt-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                    </div>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-white text-center mb-2 px-2">
                    {title}
                </h2>

                {description && (
                    <p className="text-gray-400 text-center text-xs sm:text-sm mb-3 sm:mb-4 px-2 leading-relaxed">
                        {description}
                    </p>
                )}

                {itemName && (
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-2.5 sm:p-3 mb-4 sm:mb-6">
                        <p className="text-white text-xs sm:text-sm font-medium truncate text-center">
                            {itemName}
                        </p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                    <button
                        onClick={onClose}
                        className="w-full sm:flex-1 px-4 py-3 sm:py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 active:bg-gray-700 transition-colors font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation order-2 sm:order-1"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="w-full sm:flex-1 px-4 py-3 sm:py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 active:bg-red-700 transition-colors font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation order-1 sm:order-2"
                        disabled={isLoading}
                    >
                        {isLoading ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;
