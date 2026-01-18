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

class MessageResponse(BaseModel):
    """Response for a single message."""
    role: str
    content: str
    timestamp: str

class ConversationHistoryResponse(BaseModel):
    """Response containing conversation state from PostgreSQL and LangGraph."""
    session_id: str
    created_at: str
    updated_at: str
    message_count: int
    messages: List[MessageResponse]
    current_state: dict
    conversation_history: str  

class DeleteConversationResponse(BaseModel):
    """Response for deleting a conversation."""
    message: str
    deleted: bool  

class ConversationSummary(BaseModel):
    """Summary of a conversation."""
    session_id: str
    created_at: str
    updated_at: str
    message_count: int   


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
        response_model=ConversationQuestionResponse,
        status_code=status.HTTP_200_OK
        )
async def ask_in_conversation(
    session_id: str,
    payload: ConversationQuestionRequest
) -> ConversationQuestionResponse :
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
        return ConversationQuestionResponse(**result)
        # return ConversationQuestionResponse(
        #     session_id=session_id,
        #     answer=result.get("answer", ""),
        #     context=result.get("context", ""),
        #     message_count=result.get("message_count", 0),
        #     conversation_history=result.get("conversation_history", "")
        # )


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
    

# get full conversation history for a session
@conversation_router.get(
    "/{session_id}",
    response_model=ConversationHistoryResponse,
    status_code=status.HTTP_200_OK
)
async def get_conversation_history(session_id: str, limit: Optional[int]= None ) -> ConversationHistoryResponse:
    """Retrieve the full conversation history for a session.
    
    Args:
        session_id: The conversation session identifier.
        limit: Optional limit on number of messages to return.
    
    Returns:
        Complete conversation history with metadata and messages.
    
    Raises:
        404: If session_id is not found.
    """

    service = get_conversation_service()

    try:
        history = service.get_conversation_history(session_id, limit=limit)

        return ConversationHistoryResponse(
            session_id=history["session_id"],
            created_at=history["created_at"],
            updated_at=history["updated_at"],
            message_count=history["message_count"],
            messages=[MessageResponse(**msg) for msg in history["messages"]],
            current_state=history["current_state"],
            conversation_history=history["conversation_history"]
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except ConnectionError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve conversation history: {str(e)}"
        )
    

# delete conversation 
@conversation_router.delete(
    "/{session_id}",
    response_model=DeleteConversationResponse,
    status_code=status.HTTP_200_OK
)
async def delete_conversation(session_id: str) -> DeleteConversationResponse:
    """Delete a conversation session and its history.
    
    Args:
        session_id: The conversation session identifier.
    
    Returns:
        Confirmation of deletion.
    """
    service = get_conversation_service()
    
    try:
        deleted = service.delete_conversation(session_id)

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Session {session_id} not found"
            )
        
        return DeleteConversationResponse(
            message=f"Conversation {session_id} deleted successfully",
            deleted=True
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except ConnectionError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete conversation: {str(e)}"
        )


# get conversations list 
@conversation_router.get(
    "/",
    response_model=List[ConversationSummary],
    status_code=status.HTTP_200_OK
)
async def list_conversations(limit: Optional[int] = None) -> List[ConversationSummary]:
    """List all active conversations with metadata.
    
    Args:
        limit: Optional limit on number of conversations to return.
    
    Returns:
        List of conversation summaries.
    """
    service = get_conversation_service()

    try:
        conversations = service.list_conversations(limit=limit)
        return [ConversationSummary(**conv) for conv in conversations]
    
    except ConnectionError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list conversations: {str(e)}"
        )

