export interface FileUploadResponse {
    status: string;
    message: string;
    chunks_indexed: number;
    file_id: string;
}

export interface FileListItem {
    file_id: string;
    filename: string;
    uploaded_at: string;
    chunks_count: number;
}

export interface FilesListResponse {
    files: FileListItem[];
    total_count: number;
}