from functools import lru_cache
from typing import List

from pinecone import Pinecone
from langchain_core.documents import Document
from langchain_pinecone import PineconeVectorStore
from langchain_openai import OpenAIEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from ..config import get_settings

# vector store 
@lru_cache(maxsize=1)
def _get_vector_store() -> PineconeVectorStore:
    """Create a PineconeVectorStore instance configured from settings."""
    settings = get_settings()

    pc = Pinecone(api_key=settings.pinecone_api_key)
    index = pc.Index(settings.pinecone_index_name)

    embeddings = OpenAIEmbeddings(
        model=settings.openai_embedding_model_name,
        api_key=settings.openai_api_key
    )

    # return the vetcor store 
    return PineconeVectorStore(
        index=index,
        embedding=embeddings
    )

def get_retriever(k: int | None = None):
    """Get a Pinecone retriever instance.

    Args:
        k: Number of documents to retrieve (defaults to config value).

    Returns:
        PineconeVectorStore instance configured as a retriever.
    """

    settings = get_settings()
    if k is None:
        k = settings.retrieval_k

    vector_store = _get_vector_store()
    return vector_store.as_retriever(search_kwargs={"k": k})    


def retrieve(query: str, k:int | None = None, file_id: str | None = None) -> List[Document]:
    """Retrieve documents from Pinecone for a given query.

    Args:
        query: Search query string.
        k: Number of documents to retrieve (defaults to config value).
        file_id: Optional file_id to filter results to a specific uploaded file.

    Returns:
        List of Document objects with metadata (including page numbers).
    """

    settings = get_settings()
    if k is None:
        k = settings.retrieval_k

    vector_store = _get_vector_store()

    # get the relavangt documnets according to the query (filter chunks by file metadata)
    if file_id:
        retriever = vector_store.as_retriever(search_kwargs={
            "k" : k,
            "filter" : {"file_id": file_id}
            }
        )
    else:
        retriever = vector_store.as_retriever(search_kwargs={"k": k})    

    return retriever.invoke(query)


# index documents
def index_documents(docs,file_id: str = None, filename: str = None) -> int:
    """Index a list of Document objects into the Pinecone vector store.

    Args:
        docs: Documents to embed and upsert into the vector index.
        file_id: Unique identifier for the source file (for filtering).
        filename: Original filename for reference.

    Returns:
        The number of documents indexed.
    """

    # split the documnet 
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    texts = text_splitter.split_documents(docs)

    # add meta data to each chunk 
    if file_id:
        for doc in texts:
            doc.metadata["file_id"] = file_id
            if filename:
                doc.metadata["filename"] = filename

    # add chunks to the vector store 
    vector_store = _get_vector_store()
    vector_store.add_documents(texts)
    return len(texts)