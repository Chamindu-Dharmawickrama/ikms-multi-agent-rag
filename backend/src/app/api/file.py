from fastapi import APIRouter
from pathlib import Path
from fastapi import  File, HTTPException, UploadFile, status
from ..services.indexing_service import index_pdf_file
from pydantic import BaseModel

file_router = APIRouter(prefix="/files")

class IndexResponse(BaseModel):
    status: str
    message: str
    chunks_indexed: int

# index the file 
@file_router.post("/index-pdf", status_code=status.HTTP_200_OK)
async def index_pdf(file : UploadFile = File(...)) -> IndexResponse:
    """Upload a PDF and index it into the vector database.

    This endpoint:
    - Accepts a PDF file upload
    - Saves it to the local `data/uploads/` directory
    - Uses PyPDFLoader to load the document into LangChain `Document` objects
    - Indexes those documents into the configured Pinecone vector store
    """

    if file.content_type not in ("application/pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported."
        )
    
    # ---- first need to save the file in backend ----

    # base llocation that file need to go
    upload_dir = Path("data/uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)

    # full file path name 
    file_path = upload_dir / file.filename
    contents = await file.read()

    # save the file content to the file path 
    file_path.write_bytes(contents)

    # index the saved file 
    chunks_indexed = index_pdf_file(file_path)

    return IndexResponse(
        status= "success",
        message= f"PDF '{file.filename}' uploaded and indexed successfully",
        chunks_indexed = chunks_indexed,
    )