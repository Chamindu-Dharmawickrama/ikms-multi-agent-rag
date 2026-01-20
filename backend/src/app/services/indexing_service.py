"""Service functions for indexing documents into the vector database."""

from langchain_community.document_loaders import PyPDFLoader
from ..core.retrieval.vector_store import index_documents
from ..db.db_service import get_conversation_db_service
from datetime import datetime

def index_pdf_file(file_path:str,file_id: str, filename: str)->int:
    """Load a PDF from disk and index it into the vector DB with file tracking.

    Args:
        file_path: Path to the PDF file on disk.
        file_id: Unique identifier for this file.
        filename: Original filename for tracking.

    Returns:
        Number of document chunks indexed.
    """
    loader = PyPDFLoader(str(file_path), mode="single")
    docs = loader.load()

    # Store file metadata in database
    db_service = get_conversation_db_service()
    db_service.create_file_record(
        file_id=file_id,
        filename=filename,
        file_path=str(file_path),
        metadata={"uploaded_at": datetime.utcnow().isoformat()}
    )

    # Index documents with file_id metadata
    return index_documents(docs ,file_id=file_id, filename=filename)