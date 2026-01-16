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
    
        session_id = str(uuid4())

        # Create conversation in PostgreSQL database
        self.db_service.create_conversation(
            session_id = session_id,
            metadata = {"created_at": datetime.utcnow().isoformat()}
        )

        return session_id    
        

    # ask questions
    def ask_question(self, session_id: str, question: str) -> Dict[str, Any]:
        """Ask a question within a conversation context.
        
        LangGraph's PostgreSQL checkpointer automatically manages conversation history
        via the thread_id (session_id). We also store messages in our custom database
        for additional querying capabilities.
        
        Args:
            session_id: The conversation session ID (used as thread_id).
            question: The user's question.
        
        Returns:
            Dictionary containing answer, context, and session information.
        
        Raises:
            ValueError: If session_id is not found.
        """

        # verify session exists
        conversation = self.db_service.get_conversation(session_id=session_id)
        if not conversation:
            raise ValueError(f"Session {session_id} not found")
        
        # add user msg to db 
        self.db_service.add_message(
            session_id=session_id,
            role="USER",
            content=question,
            metadata={"timestamp": datetime.utcnow().isoformat()}
        )

        # Run QA flow with history
               
    

# Singleton instance
_conversation_service : Optional[ConversationService] = None

def get_conversation_service() -> ConversationService:
    global _conversation_service
    if _conversation_service is None:
        _conversation_service = ConversationService()
    return _conversation_service    