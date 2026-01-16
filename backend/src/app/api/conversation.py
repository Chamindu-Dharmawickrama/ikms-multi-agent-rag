"""API endpoints for conversational multi-turn QA."""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from ..services.conversation_service import get_conversation_service

conversation_router = APIRouter(prefix="/conversations", tags=["conversations"])

class CreateConversationResponse(BaseModel):
    """Response for creating a new conversation."""
    session_id: str
    message: str


# create a new conversation session (Session id and confirmation message.)
@conversation_router.post(
        "/",
        response_model=CreateConversationResponse,
        status_code=status.HTTP_201_CREATED
)
async def create_conversation()-> CreateConversationResponse:
    """Create a new conversation session.
    
    Returns:
        session_id and confirmation message.
        
    Raises:
        HTTPException: 503 if database is unavailable
        HTTPException: 500 for other unexpected errors
    """
    try:
        service = get_conversation_service()
        session_id = service.create_conversation()

        return CreateConversationResponse(
            session_id=session_id,
            message="Conversation session created successfully"
        )
    
    except ConnectionError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {str(e)}"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create conversation: {str(e)}"
        )
