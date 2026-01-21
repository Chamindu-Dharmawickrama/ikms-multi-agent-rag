from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
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
    print(f"DATABASE_URL configured: {bool(os.getenv('DATABASE_URL'))}")
    print(f"OPENAI_API_KEY configured: {bool(os.getenv('OPENAI_API_KEY'))}")
    print(f"PINECONE_API_KEY configured: {bool(os.getenv('PINECONE_API_KEY'))}")
    
    try:
        print("Initializing database...")
        init_database()
        print("Database initialized successfully!")
        
        print("Creating LangGraph checkpointer...")
        get_postgres_checkpointer()
        print("Checkpointer created successfully!")
    except Exception as e:
        print(f"ERROR during startup: {e}")
        import traceback
        traceback.print_exc()
        # Don't raise - allow app to start even if DB fails
        print("WARNING: Continuing without database initialization")

    #before yield → startup
    #after yield → shutdown    
    yield

    print("Shutting down application...")
    try:
        close_connection_pool()
        print("Database connections closed!")
    except Exception as e:
        print(f"Error closing connections: {e}")


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

# Configure CORS
import os
allowed_origins = [
    "http://localhost:5173",
    os.getenv("FRONTEND_URL", ""),  
]

allowed_origins = [origin for origin in allowed_origins if origin]

server.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

@server.get("/health")
def root():
    return {"status": "API is running"}

# exception handling 
@server.exception_handler(Exception)
async def unhandled_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:  
    """Catch-all handler for unexpected errors.

    FastAPI will still handle `HTTPException` instances and validation errors
    separately; this is only for truly unexpected failures so API consumers
    get a consistent 500 response body.
    """

    if isinstance(exc, HTTPException):
        raise exc

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )

# routes
server.include_router(ask_router)
server.include_router(file_router)
server.include_router(conversation_router)
