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

class ConversationQuestionRequest(BaseModel):
    """Request body for asking a question in a conversation."""
    question: str

class ConversationQuestionResponse(BaseModel):
    """Response for a conversation question."""
    session_id: str
    answer: str
    context: str
    message_count: int
    conversation_history: Optional[str] = None

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

# ask questions 
@conversation_router.post(
        "/{session_id}/ask",
        status_code=status.HTTP_200_OK
        )
async def ask_in_conversation(
    session_id: str,
    payload: ConversationQuestionRequest
) :
    """Ask a question within a conversation context.
    
    This endpoint maintains conversation history and provides
    context-aware responses across multiple turns.
    
    Args:
        session_id: The conversation session identifier.
        payload: Question and history preferences.
    
    Returns:
        Answer with conversation context.
    
    Raises:
        404: If session_id is not found.
        400: If question is empty.
    """

    question = payload.question.strip()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="`question` must be a non-empty string."
        )

    service = get_conversation_service()

    try:
        result = service.ask_question(
            session_id=session_id,
            question=question
        )

        # ** unpacks a dictionary into keyword arguments
        #return ConversationQuestionResponse(**result)
        return "pass"


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
            detail=f"Failed to ask question: {str(e)}"
        )

    
