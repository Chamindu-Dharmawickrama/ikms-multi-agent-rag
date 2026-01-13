"""Service functions for indexing documents into the vector database."""

from langchain_community.document_loaders import PyPDFLoader
from ..core.retrieval.vector_store import index_documents

def index_pdf_file(file_path:str)->int:
    """Load a PDF from disk and index it into the vector DB.

    Args:
        file_path: Path to the PDF file on disk.

    Returns:
        Number of document chunks indexed.
    """
    loader = PyPDFLoader(str(file_path), mode="single")
    docs = loader.load()
    return index_documents(docs)