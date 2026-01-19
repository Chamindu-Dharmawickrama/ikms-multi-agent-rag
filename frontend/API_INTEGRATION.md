# API Integration Structure

## Folder Structure

```
src/
├── services/
│   └── api/
│       ├── axios.ts          # Axios instance with interceptors
│       ├── fileService.ts    # File upload API calls
│       └── index.ts          # Export all services
├── store/
│   └── useFileStore.ts       # Zustand store for file uploads
├── types/
│   └── file.ts               # TypeScript types for files
└── pages/
    └── dashboard/
        └── features/
            └── uploadDocuments/
                └── UploadDocuments.tsx  # Upload UI component
```

## How It Works

### 1. **Axios Configuration** (`services/api/axios.ts`)

- Configured base URL from environment variables
- Request/response interceptors for auth and error handling
- 30s timeout for file uploads

### 2. **File Service** (`services/api/fileService.ts`)

- `uploadFile()` - Upload single PDF file
- `uploadMultipleFiles()` - Upload multiple files in parallel
- Uses FormData for multipart/form-data uploads

### 3. **Zustand Store** (`store/useFileStore.ts`)

- Manages file upload state globally
- Actions:
    - `addFiles()` - Add files to queue
    - `removeFile()` - Remove file from queue
    - `uploadFiles()` - Upload all pending files
    - `clearFiles()` - Clear all files
    - `resetError()` - Clear error message

### 4. **TypeScript Types** (`types/file.ts`)

- `UploadedFile` - File with upload status
- `FileUploadResponse` - Backend response type

## Usage

### Environment Setup

Create `.env` file:

```
VITE_API_BASE_URL=http://localhost:8000
```

### Backend API Endpoint

The upload expects this endpoint:

```
POST /api/file/upload
Content-Type: multipart/form-data
Body: FormData with 'file' field
```

### Component Usage

```tsx
import { useFileStore } from "@/store/useFileStore";

const { files, isUploading, uploadFiles } = useFileStore();
```

## Features

- ✅ Drag and drop support
- ✅ Multiple file selection
- ✅ Upload status tracking (pending/uploading/success/error)
- ✅ Error handling with user feedback
- ✅ TypeScript support
- ✅ Global state management with Zustand
- ✅ Axios interceptors for request/response handling
