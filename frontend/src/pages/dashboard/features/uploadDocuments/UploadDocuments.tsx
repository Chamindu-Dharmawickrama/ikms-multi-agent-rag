import React, { useState, useRef, useEffect } from "react";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../../store/store";
import {
    clearUploadState,
    uploadFile,
} from "../../../../store/fileUpload/fileSlice";

const UploadDocuments = () => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const dispatch = useDispatch<AppDispatch>();

    const { uploading, uploadSuccess, uploadError, fileData } = useSelector(
        (state: RootState) => state.fileUpload,
    );

    // Clear file state after successful upload
    useEffect(() => {
        if (uploadSuccess) {
            setFile([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }, [uploadSuccess]);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFiles = Array.from(e.dataTransfer.files).filter(
                (file) => file.type === "application/pdf",
            );
            setFile(droppedFiles);
            // Reset input value to keep it in sync
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const selectedFile = Array.from(e.target.files).filter(
                (file) => file.type === "application/pdf",
            );
            setFile(selectedFile);
            // Reset input value to ensure onChange fires even for same file
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
        dispatch(clearUploadState());
    };

    const handleUpload = async () => {
        if (file.length > 0) {
            dispatch(clearUploadState());
            const formData = new FormData();
            formData.append("file", file[0]);
            dispatch(uploadFile(formData));
        }
    };

    const handleFileClear = () => {
        setFile([]);
        dispatch(clearUploadState());
        // Reset file input value
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const animateUploadText = () => {
        return (
            <span className="flex items-center gap-1">
                Indexing
                <span className="ml-2 flex gap-0.5">
                    <span
                        className="animate-bounce text-2xl"
                        style={{ animationDelay: "0ms" }}
                    >
                        .
                    </span>
                    <span
                        className="animate-bounce text-2xl"
                        style={{ animationDelay: "150ms" }}
                    >
                        .
                    </span>
                    <span
                        className="animate-bounce text-2xl"
                        style={{ animationDelay: "300ms" }}
                    >
                        .
                    </span>
                </span>
            </span>
        );
    };

    console.log("file ", file);

    return (
        <div className="h-full overflow-y-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <div className="flex flex-row gap-5 items-center justify-center mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gray-200 flex items-center justify-center">
                            <Upload className="w-8 h-8 text-custom-dark" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">
                            Upload PDF Documents
                        </h1>
                    </div>

                    <p className="text-sm sm:text-base text-gray-600">
                        Index your documents for intelligent question answering
                    </p>
                </div>

                {/* Upload Area */}
                <div
                    className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 transition-all ${
                        dragActive
                            ? "border-blue-800 bg-indigo-50"
                            : "border-gray-300 bg-gray-50/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf"
                        onChange={handleChange}
                        className="hidden"
                    />

                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <Upload
                                className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400"
                                strokeWidth={1.5}
                            />
                        </div>

                        <p className="text-base sm:text-lg text-gray-700 mb-2">
                            Drag and drop your PDF here
                        </p>
                        <p className="text-sm text-gray-500 mb-6">or</p>

                        <button
                            onClick={handleBrowseClick}
                            className="px-6 py-3 bg-custom-dark-less hover:bg-custom-dark-more text-white font-medium rounded-lg transition-colors cursor-pointer"
                        >
                            Browse Files
                        </button>
                    </div>
                </div>

                {/* Selected Files Display */}
                {file.length > 0 && (
                    <div className="mt-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Selected File ({file.length})
                        </h3>
                        <div className="space-y-3">
                            {file.map((f, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <FileText className="w-10 h-10 text-blue-800 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                {f.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {(f.size / 1024).toFixed(2)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setFile(
                                                file.filter(
                                                    (_, i) => i !== index,
                                                ),
                                            );
                                            handleFileClear();
                                        }}
                                        className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-red-700" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Upload Button */}
                {file.length > 0 && (
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="
                                px-8 py-3 bg-custom-dark-less text-white font-medium rounded-lg
                                flex items-center gap-2 cursor-pointer
                                hover:bg-custom-dark-more
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        >
                            {uploading ? (
                                animateUploadText()
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" /> Upload{" "}
                                    {file.length}{" "}
                                    {file.length === 1 ? "File" : "Files"}
                                </>
                            )}
                            {uploadError ? " - Retry" : ""}
                        </button>
                    </div>
                )}

                {uploadSuccess && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="text-green-800 text-[17px]">
                            {fileData?.message}
                        </p>
                    </div>
                )}

                {uploadError && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-red-800">{uploadError}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadDocuments;
