"""Service layer for managing conversational QA with PostgreSQL persistence."""

from typing import Dict, Any, Optional
from uuid import uuid4
from datetime import datetime
from ..db.db_service import get_conversation_db_service
from ..core.agents.graph import run_qa_flow_with_history, get_conversation_state

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
    def create_conversation (self, file_id: str = None) -> str:
        """Create a new conversation session in PostgreSQL.

        Args:
            file_id: Optional file_id to associate with this conversation.

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
            metadata = {"created_at": datetime.utcnow().isoformat()},
            active_file_id=file_id
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
        
        file_id = conversation.active_file_id
        
        # add user msg to db 
        self.db_service.add_message(
            session_id=session_id,
            role="USER",
            content=question,
            metadata={"timestamp": datetime.utcnow().isoformat()}
        )

        # Run QA flow with history
        result = run_qa_flow_with_history(question, thread_id=session_id, file_id=file_id)
        answer = result.get("answer", "")

        # Add assistant response to database
        self.db_service.add_message(
            session_id=session_id,
            role="Assistant", 
            content=answer,
            metadata={
                "timestamp": datetime.utcnow().isoformat(),
                "context": result.get("context", "")[:500]
            }
        )

        updated_conversation = self.db_service.get_conversation(session_id)

        return {
            "session_id": session_id,
            "answer": answer,
            "context": result.get("context", ""),
            "message_count": updated_conversation.message_count if updated_conversation else 0,
            "conversation_history": result.get("conversation_history", "")
        }


    def get_conversation_history(self, session_id: str, limit:Optional[int] = None ) -> Dict[str, any]:
         
        """Retrieve the conversation from PostgreSQL database.
        
        Args:
            session_id: The conversation session ID.
            limit: Optional limit on number of messages to retrieve.
        
        Returns:
            Dictionary with session info, messages, and current state.
        
        Raises:
            ValueError: If session_id is not found.
        """
        
        conversation = self.db_service.get_conversation(session_id, include_messages=True)
        if not conversation:
            raise ValueError(f"Session {session_id} not found")
        
        # get the messages for the session id
        messages = self.db_service.get_messages(session_id, limit)

        # get the LangGraph state
        state = get_conversation_state(session_id)   

        # Get filename if file_id exists
        filename = None
        if conversation.active_file_id:
            file_record = self.db_service.get_file_record(conversation.active_file_id)
            if file_record:
                filename = file_record.filename

        return {
            "session_id": session_id,
            "created_at": conversation.created_at.isoformat(),
            "updated_at": conversation.updated_at.isoformat(),
            "message_count": conversation.message_count,
            "active_file_id": conversation.active_file_id,
            "filename": filename,
            "messages": [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.timestamp.isoformat()
                }
                for msg in messages
            ],
            "current_state": state or {},
            "conversation_history": state.get("conversation_history", "") if state else ""                                                
        }


    def delete_conversation(self, session_id: str) -> bool:
        """Delete a conversation session from PostgreSQL.
        
        Note: This removes the conversation from our database. The LangGraph
        checkpointer state also persists in PostgreSQL and will be automatically
        cleaned up or can be managed separately.
        
        Args:
            session_id: The conversation session ID.
        
        Returns:
            True if deleted, False if not found.
        """
        return self.db_service.delete_conversation(session_id)  


    def list_conversations(self, limit: Optional[int] = None) -> list[Dict[str, Any]]:
        """List all conversations from PostgreSQL.
        
        Args:
            limit: Optional limit on number of conversations to return.
        
        Returns:
            List of conversation summaries.
        """

        conversations = self.db_service.list_conversations(limit=limit)

    
        result = [
            {
                "session_id": conv.session_id,
                "created_at": conv.created_at.isoformat(),
                "updated_at": conv.updated_at.isoformat(),
                "message_count": conv.message_count,
                "active_file_id": conv.active_file_id,
                "filename": conv.filename 
            }
            for conv in conversations
        ]
        
        return result
    

_conversation_service : Optional[ConversationService] = None

def get_conversation_service() -> ConversationService:
    global _conversation_service
    if _conversation_service is None:
        _conversation_service = ConversationService()
    return _conversation_service    