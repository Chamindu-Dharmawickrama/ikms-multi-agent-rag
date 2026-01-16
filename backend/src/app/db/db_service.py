"""Database service for managing conversations in PostgreSQL."""

from typing import List, Optional, Dict, Any
from datetime import datetime
import json
from .connection import get_db_connection
from ..db.models import MessageDB, ConversationDB

class ConversationDatabaseService:
    """Service for managing conversations and messages in PostgreSQL."""

    # make a new conversation on the db
    def create_conversation(self, session_id: str, metadata: Optional[Dict[str,any]]= None) -> ConversationDB:
        """Create a new conversation in the database.
        
        Args:
            session_id: Unique identifier for the conversation.
            metadata: Optional metadata to store with the conversation.
            
        Returns:
            ConversationDB instance.
            
        Raises:
            psycopg.Error: If database operation fails
        """
        try:
            with get_db_connection() as connection:
                with connection.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO conversations (session_id, metadata)
                        VALUES (%s, %s)
                        RETURNING session_id, created_at, updated_at, message_count, metadata            
                    """, (session_id, json.dumps(metadata or {})))

                    conversation_row = cursor.fetchone()
                    # permanent save the data on db
                    connection.commit()

                    return ConversationDB(
                        session_id=conversation_row["session_id"],
                        created_at=conversation_row["created_at"],
                        updated_at=conversation_row["updated_at"],
                        message_count=conversation_row["message_count"],
                        metadata=conversation_row["metadata"]
                    )
        except Exception as e:
            raise Exception(f"Database error creating conversation: {str(e)}") from e  


# singleton instance
_db_service : Optional[ConversationDatabaseService] = None

def get_conversation_db_service() -> ConversationDatabaseService:
    global _db_service
    if _db_service is None:
        _db_service = ConversationDatabaseService()
    return _db_service    



                 
                



