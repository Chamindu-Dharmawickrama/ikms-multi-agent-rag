import api from "../../utils/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { FilesListResponse, FileUploadResponse } from "../../types/file";

interface FileState {
    uploading: boolean;
    uploadSuccess: boolean;
    uploadError: string | null;
    fileData?: FileUploadResponse;
    filesFetching: boolean;
    filesFetchError: string | null;
    filesList?: FilesListResponse;
}

const initialState: FileState = {
    uploading: false,
    uploadSuccess: false,
    uploadError: null,
    fileData: undefined,
    filesFetching: false,
    filesFetchError: null,
    filesList: undefined,
};

// file upload
export const uploadFile = createAsyncThunk<
    FileUploadResponse,
    FormData,
    { rejectValue: string }
>("fileUpload/uploadFile", async (uploadedFile, { rejectWithValue }) => {
    try {
        const response = await api.post<FileUploadResponse>(
            "/files/index-pdf",
            uploadedFile,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
        );
        return response.data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "File upload failed",
        );
    }
});

// get all files
export const fetchFiles = createAsyncThunk<
    FilesListResponse,
    void,
    { rejectValue: string }
>("/fetchFiles", async (_, { rejectWithValue }) => {
    try {
        const response = await api.get<FilesListResponse>("/files/");
        return response.data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Fetching files failed",
        );
    }
});

const fileSlice = createSlice({
    name: "file",
    initialState,
    reducers: {
        clearUploadState: (state) => {
            state.uploading = false;
            state.uploadSuccess = false;
            state.uploadError = null;
            state.fileData = undefined;
        },
        clearFilesError: (state) => {
            state.filesFetchError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(uploadFile.pending, (state) => {
                state.uploading = true;
                state.uploadSuccess = false;
                state.uploadError = null;
            })
            .addCase(uploadFile.fulfilled, (state, action) => {
                state.uploading = false;
                state.uploadSuccess = true;
                state.fileData = action.payload;
            })
            .addCase(uploadFile.rejected, (state, action) => {
                state.uploading = false;
                state.uploadSuccess = false;
                state.uploadError = action.payload || "File upload failed";
            })
            .addCase(fetchFiles.pending, (state) => {
                state.filesFetching = true;
                state.filesFetchError = null;
            })
            .addCase(fetchFiles.fulfilled, (state, action) => {
                state.filesFetching = false;
                state.filesList = action.payload;
            })
            .addCase(fetchFiles.rejected, (state, action) => {
                state.filesFetching = false;
                state.filesFetchError =
                    action.payload || "Fetching files failed";
            });
    },
});

export const { clearUploadState, clearFilesError } = fileSlice.actions;
export default fileSlice.reducer;
