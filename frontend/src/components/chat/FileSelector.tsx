import { useEffect, useState } from "react";
import { FileText, RefreshCw, Loader2, ChevronDown, Lock } from "lucide-react";
import { clearFilesError, fetchFiles } from "../../store/fileUpload/fileSlice";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import type { FileListItem } from "../../types/file";

interface FileSelectorProps {
    selectedFileId: string | null;
    onFileSelect: (fileId: string, filename: string) => void;
    disabled?: boolean;
    locked?: boolean;
}

const FileSelector = ({
    selectedFileId,
    onFileSelect,
    disabled,
    locked = false,
}: FileSelectorProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const [isOpen, setIsOpen] = useState(false);

    const isDisabled = disabled || locked;

    useEffect(() => {
        dispatch(fetchFiles());
    }, []);

    const { filesList, filesFetching, filesFetchError } = useSelector(
        (state: RootState) => state.file,
    );

    const selectedFile = filesList?.files.find(
        (file) => file.file_id === selectedFileId,
    );

    const handleFileClick = (file: FileListItem) => {
        onFileSelect(file.file_id, file.filename);
        setIsOpen(false);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (filesFetching) {
        return (
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gary-200 rounded-lg">
                <Loader2 className="w-4 h-4 text-custom-dark animate-spin" />
                <span className="text-sm text-custom-dark">
                    Loading files...
                </span>
            </div>
        );
    }

    if (filesFetchError) {
        return (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{filesFetchError}</p>
                <button
                    onClick={() => {
                        dispatch(fetchFiles());
                        dispatch(clearFilesError());
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (!filesList || filesList.files.length === 0) {
        return (
            <div className="px-4 py-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                    No files uploaded yet
                </p>
                <p className="text-xs text-gray-500">
                    Upload a PDF file to start chatting
                </p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Selected File Display */}
            <button
                onClick={() => !isDisabled && setIsOpen(!isOpen)}
                disabled={isDisabled}
                className={`w-full px-4 py-3 bg-white border-2 rounded-lg transition-colors flex items-center justify-between gap-3 ${
                    locked
                        ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                        : "border-custom-dark-less hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {!locked && (
                        <FileText className="w-5 h-5 text-custom-dark shrink-0" />
                    )}
                    <div className="flex flex-row justify-between min-w-0 gap-2 flex-1">
                        {selectedFile ? (
                            <>
                                <p
                                    className={`text-sm font-medium truncate text-left ${locked ? "text-gray-700" : "text-gray-900"}`}
                                >
                                    {selectedFile.filename}
                                </p>
                                <p className="text-xs text-gray-500 text-right flex items-center gap-1 justify-end">
                                    {locked
                                        ? "Locked to this file"
                                        : `Uploaded ${formatDate(selectedFile.uploaded_at)}`}
                                    {locked && (
                                        <Lock className="w-4 h-4 mb-1 ml-1 text-gray-500 shrink-0" />
                                    )}
                                </p>
                            </>
                        ) : (
                            <p className="text-sm text-gray-600">
                                Select a file to chat with...
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                    {!locked && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                dispatch(fetchFiles());
                            }}
                            className="p-1 hover:bg-blue-100 rounded transition-colors"
                            title="Refresh files"
                        >
                            <RefreshCw className="w-6 md:w-5 h-6 md:h-5 text-blue-900 cursor-pointer" />
                        </button>
                    )}
                    {!locked && (
                        <ChevronDown
                            className={`w-6 md:w-6 h-6 md:h-6 text-blue-900 transition-transform ${isOpen ? "rotate-180" : ""} cursor-pointer`}
                        />
                    )}
                </div>
            </button>

            {/* Dropdown List */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Files List */}
                    <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                        <div className="p-2">
                            <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                                Available Files ({filesList.total_count})
                            </p>
                            {filesList.files.map((file) => (
                                <button
                                    key={file.file_id}
                                    onClick={() => handleFileClick(file)}
                                    className={`w-full px-3 py-2.5 rounded-md text-left hover:bg-blue-50 transition-colors group ${
                                        file.file_id === selectedFileId
                                            ? "bg-blue-100 border border-blue-300"
                                            : "border border-transparent"
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <FileText
                                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                                                file.file_id === selectedFileId
                                                    ? "text-blue-600"
                                                    : "text-gray-400 group-hover:text-blue-500"
                                            }`}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className={`text-sm font-medium truncate ${
                                                    file.file_id ===
                                                    selectedFileId
                                                        ? "text-blue-900"
                                                        : "text-gray-900"
                                                }`}
                                            >
                                                {file.filename}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {formatDate(file.uploaded_at)}
                                            </p>
                                        </div>
                                        {file.file_id === selectedFileId && (
                                            <span className="text-xs font-medium text-blue-600 shrink-0">
                                                Selected
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default FileSelector;
