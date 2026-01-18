from fastapi import FastAPI, HTTPException, Request, status
from .services.indexing_service import index_pdf_file
from fastapi.responses import JSONResponse
from .api.ask import ask_router
from .api.file import file_router
from .api.conversation import conversation_router
from contextlib import asynccontextmanager
from .db.connection import init_database , close_connection_pool
from .db.checkpointer import get_postgres_checkpointer


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events."""
    print("Starting application...")
    try:
        init_database()
        # creates LangGraph tables
        get_postgres_checkpointer()
    except Exception as e:
        print(f"Database initialization failed!!: {e}")
        raise

    #before yield → startup
    #after yield → shutdown    
    yield

    print("Shutting down application...")
    close_connection_pool()
    print("Database connections closed!")


server = FastAPI(
    title="Multi-Agent RAG Demo",
    description=(
        "Demo API for asking questions about a vector databases paper. "
        "The `/qa` endpoint currently returns placeholder responses and "
        "will be wired to a multi-agent RAG pipeline in later user stories."
    ),
    version="0.1.0",
    lifespan= lifespan
)

@server.get("/health")
def root():
    return {"status": "API is running"}

# exception handling 
@server.exception_handler(Exception)
async def unhandled_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:  # pragma: no cover - simple demo handler
    """Catch-all handler for unexpected errors.

    FastAPI will still handle `HTTPException` instances and validation errors
    separately; this is only for truly unexpected failures so API consumers
    get a consistent 500 response body.
    """

    if isinstance(exc, HTTPException):
        # Let FastAPI handle HTTPException as usual.
        raise exc

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )

# routes
server.include_router(ask_router)
server.include_router(file_router)
server.include_router(conversation_router)
