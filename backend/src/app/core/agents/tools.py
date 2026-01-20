"""Tools available to agents in the multi-agent RAG system."""

from langchain_core.tools import tool

from ..retrieval.vector_store import retrieve
from ..retrieval.serialization import serialize_chunks

@tool(response_format="content_and_artifact")
def retrieval_tool(query: str, file_id: str = None):
    """Search the vector database for relevant document chunks.

    This tool retrieves the top 4 most relevant chunks from the Pinecone
    vector store based on the query. The chunks are formatted with page
    numbers and indices for easy reference.

    Args:
        query: The search query string to find relevant document chunks.
        file_id: Optional file identifier to limit search to a specific uploaded file.
            If provided, only chunks from this file will be returned.

    Returns:
        Tuple of (serialized_content, artifact) where:
        - serialized_content: A formatted string containing the retrieved chunks
          with metadata. Format: "Chunk 1 (page=X): ...\n\nChunk 2 (page=Y): ..."
        - artifact: List of Document objects with full metadata for reference
    """

    # Retrieve documents from vector store according to the query (Filter by file_id)
    docs = retrieve(query, k=6, file_id=file_id)

    # Serialize chunks into formatted string (content)
    context = serialize_chunks(docs)

    return context, docs
