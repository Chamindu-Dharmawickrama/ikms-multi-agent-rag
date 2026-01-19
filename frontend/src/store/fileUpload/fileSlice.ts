import api from "../../utils/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { FileUploadResponse } from "../../types/file";

interface FileUploadState {
    uploading: boolean;
    uploadSuccess: boolean;
    uploadError: string | null;
    fileData?: FileUploadResponse;
}

const initialState: FileUploadState = {
    uploading: false,
    uploadSuccess: false,
    uploadError: null,
    fileData: undefined,
};

// file upload function
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

const fileSlice = createSlice({
    name: "fileUpload",
    initialState,
    reducers: {
        clearUploadState: (state) => {
            state.uploading = false;
            state.uploadSuccess = false;
            state.uploadError = null;
            state.fileData = undefined;
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
            });
    },
});

export const { clearUploadState } = fileSlice.actions;
export default fileSlice.reducer;
