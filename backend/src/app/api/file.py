from fastapi import APIRouter, Response, Depends
from pathlib import Path
from fastapi import  File, HTTPException, UploadFile, status
from ..services.indexing_service import index_pdf_file
from pydantic import BaseModel
from typing import List
import uuid
from ..db.db_service import get_conversation_db_service
from ..core.auth import get_current_user

file_router = APIRouter(prefix="/files")

class IndexResponse(BaseModel):
    status: str
    message: str
    chunks_indexed: int
    file_id: str

class FileListItem(BaseModel):
    """Response model for a file in the list."""
    file_id: str
    filename: str
    uploaded_at: str
    chunks_count: int = 0  

class FilesListResponse(BaseModel):
    """Response model for listing all files."""
    files: List[FileListItem]
    total_count: int    


# index the file 
@file_router.post("/index-pdf", status_code=status.HTTP_200_OK)
async def index_pdf(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
) -> IndexResponse:
    """Upload a PDF and index it into the vector database.

    This endpoint:
    - Accepts a PDF file upload (requires authentication)
    - Saves it to the local `data/uploads/` directory
    - Associates the file with the authenticated user
    - Uses PyPDFLoader to load the document into LangChain `Document` objects
    - Indexes those documents into the configured Pinecone vector store
    """

    if file.content_type not in ("application/pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported."
        )

    # base location that file need to go
    upload_dir = Path("data/uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_path = upload_dir / file.filename
    contents = await file.read()

    file_path.write_bytes(contents)

    file_id = str(uuid.uuid4())
    user_id = current_user["user_id"]

    # index the saved file 
    chunks_indexed = index_pdf_file(
        file_path, 
        file_id=file_id, 
        filename=file.filename,
        user_id=user_id
    )

    return IndexResponse(
        status= "success",
        message= f"PDF '{file.filename}' uploaded and indexed successfully",
        chunks_indexed = chunks_indexed,
        file_id = file_id,
    )


# Get list of all uploaded files for the authenticated user
@file_router.get("/", response_model=FilesListResponse, status_code=status.HTTP_200_OK)
async def list_files(
    response: Response,
    current_user: dict = Depends(get_current_user)
) -> FilesListResponse:
    """Get a list of uploaded files for the authenticated user.
    
    Returns:
        List of files with their metadata (file_id, filename, uploaded_at).
    """
    try:
        db_service = get_conversation_db_service()
        user_id = current_user["user_id"]
        
        # Filter files by user_id
        files = db_service.list_files(user_id=user_id)
        
        file_items = [
            FileListItem(
                file_id=file.file_id,
                filename=file.filename,
                uploaded_at=file.uploaded_at.isoformat(),
                chunks_count=0  
            )
            for file in files
        ]
        
        # Add cache control headers
        response.headers["Cache-Control"] = "private, max-age=30"
        
        return FilesListResponse(
            files=file_items,
            total_count=len(file_items)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve files: {str(e)}"
        )