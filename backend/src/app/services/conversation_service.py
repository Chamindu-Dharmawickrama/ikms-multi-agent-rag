"""Service layer for managing conversational QA with PostgreSQL persistence."""

from typing import Dict, Any, Optional
from uuid import uuid4
from datetime import datetime
from ..db.db_service import get_conversation_db_service

class ConversationService:
    """Service for managing multi-turn conversations with PostgreSQL persistence.
    
    This service combines:
    1. LangGraph's PostgreSQL checkpointer for conversation state management
    2. PostgreSQL database for storing conversation metadata and messages
    
    Each conversation is identified by a session_id (thread_id), and both
    LangGraph and our PostgreSQL database track the conversation history.
    """ 
   
    def __init__(self):
        self.db_service = get_conversation_db_service()

    # create new conversation
    def create_conversation (self) -> str:
        """Create a new conversation session in PostgreSQL.
        
        Returns:
            session_id: The unique identifier for the conversation (used as thread_id).
            
        Raises:
            ConnectionError: If database connection fails
            Exception: For other database errors
        """
        try:
            session_id = str(uuid4())

            # Create conversation in PostgreSQL database
            self.db_service.create_conversation(
                session_id = session_id,
                metadata = {"created_at": datetime.utcnow().isoformat()}
            )

            return session_id
        except Exception as e:
            if "connection" in str(e).lower() or "pool" in str(e).lower():
                raise ConnectionError(f"Database connection failed: {str(e)}")
            # Otherwise, re-raise the original exception
            raise
    

# Singleton instance
_conversation_service : Optional[ConversationService] = None

def get_conversation_service() -> ConversationService:
    global _conversation_service
    if _conversation_service is None:
        _conversation_service = ConversationService()
    return _conversation_service    