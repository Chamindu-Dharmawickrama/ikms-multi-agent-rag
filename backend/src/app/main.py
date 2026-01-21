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
    import sys
    print("=" * 60)
    print("Starting application...")
    print(f"Python version: {sys.version}")
    print(f"Working directory: {os.getcwd()}")
    print("=" * 60)
    
    try:
        # Test environment variables
        from .core.config import get_settings
        settings = get_settings()
        print(f"✓ Configuration loaded successfully")
        print(f"  - Database URL: {settings.database_url[:20]}...")
        print(f"  - OpenAI Model: {settings.openai_model_name}")
        print(f"  - Pinecone Index: {settings.pinecone_index_name}")
        
        # Initialize database
        print("Initializing database...")
        init_database()
        print("Database initialized")
        
        # Initialize LangGraph checkpointer
        print("Initializing LangGraph checkpointer...")
        get_postgres_checkpointer()
        print("LangGraph checkpointer initialized")
        
        print("=" * 60)
        print("Application startup complete!")
        print("=" * 60)
        
    except Exception as e:
        print("=" * 60)
        print(f"STARTUP FAILED: {e}")
        print("=" * 60)
        import traceback
        traceback.print_exc()
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

# Configure CORS
import os
allowed_origins = [
    "http://localhost:5173",
    os.getenv("FRONTEND_URL", ""),
]

# Filter out empty strings
allowed_origins = [origin for origin in allowed_origins if origin]

# Add Railway.app domain pattern if deployed
if os.getenv("RAILWAY_ENVIRONMENT"):
    allowed_origins.append("*")  # Allow all origins in Railway for now

server.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

@server.get("/health")
def root():
    """Health check endpoint with database connectivity test."""
    try:
        from .db.connection import get_db_connection
        
        # Test database connection
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                
        return {
            "status": "healthy",
            "api": "running",
            "database": "connected"
        }
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "api": "running",
                "database": "disconnected",
                "error": str(e)
            }
        )

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
