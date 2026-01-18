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
        

    # get the conversation according to the session_id
    def get_conversation(self, session_id: str , include_messages: bool = False) -> Optional[ConversationDB]:
        """Get a conversation by session ID.
        
        Args:
            session_id: The conversation session ID.
            include_messages: Whether to include all messages in the conversation.
            
        Returns:
            ConversationDB instance or None if not found.
        """

        try:
            # get the existing conversation
            with get_db_connection() as connection:
                with connection.cursor() as cursor:
                    cursor.execute("""
                        SELECT session_id, created_at, updated_at, message_count, metadata
                        FROM conversations
                        WHERE session_id = %s                  
                    """, (session_id,))

                    conversation_row = cursor.fetchone()
                    if not conversation_row:
                        return None
                    
                    conversation = ConversationDB(
                        session_id=conversation_row["session_id"],
                        created_at=conversation_row["created_at"],
                        updated_at=conversation_row["updated_at"],
                        message_count=conversation_row["message_count"],
                        metadata=conversation_row["metadata"]
                    )

                    if include_messages:
                        messages = self.get_messages(session_id)
                        conversation.messages = messages

                    return conversation    
        except Exception as e:
            raise Exception(f"Database error getting conversation: {str(e)}") from e  


    # add message to the db
    def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> MessageDB:
        """Add a message to a conversation.
        
        Args:
            session_id: The conversation session ID.
            role: Message role ("USER" or "Assistant").
            content: Message content.
            metadata: Optional message metadata.
            
        Returns:
            MessageDB instance.
        """
        try:
            with get_db_connection() as connection:
                with connection.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO messages (session_id, role, content, metadata)
                        VALUES (%s, %s, %s, %s)
                        RETURNING id, session_id, role, content, timestamp, metadata                      
                    """,(session_id, role, content, json.dumps(metadata or {})))

                    message_row = cursor.fetchone()

                    # update the conversation's message count
                    cursor.execute("""
                        UPDATE conversations
                        SET message_count = message_count + 1,
                            updated_at = NOW()
                        WHERE session_id = %s
                    """, (session_id,))

                    connection.commit()

                    return MessageDB(
                        id=message_row["id"],
                        session_id=message_row["session_id"],
                        role=message_row["role"],
                        content=message_row["content"],
                        timestamp=message_row["timestamp"],
                        metadata=message_row["metadata"]
                    )

        except Exception as e:
            raise Exception(f"Database error adding message: {str(e)}") from e

    # get all the messages according to the session_id
    def get_messages(self, session_id: str, limit: Optional[int] = None) -> List[MessageDB]:
        """Get all messages for a conversation.
        
        Args:
            session_id: The conversation session ID.
            limit: Optional limit on number of messages to return (most recent).
            
        Returns:
            List of MessageDB instances ordered by timestamp.
        """

        try:
            with get_db_connection() as connection:
                with connection.cursor() as cursor:
                    query = """
                        SELECT id, session_id, role, content, timestamp, metadata
                        FROM messages
                        WHERE session_id = %s
                        ORDER BY timestamp ASC
                    """

                    if limit:
                        query += " LIMIT %s"
                        cursor.execute(query, (session_id, limit))
                    else:
                        cursor.execute(query, (session_id,))

                    message_rows = cursor.fetchall()

                    return [
                        MessageDB(
                            id=row["id"],
                            session_id=row["session_id"],
                            role=row["role"],
                            content=row["content"],
                            timestamp=row["timestamp"],
                            metadata=row["metadata"]                        
                        ) for row in message_rows
                    ]

        except Exception as e:
            raise Exception(f"Database error getting messages: {str(e)}") from e
        
    # delete conversation  
    def delete_conversation(self, session_id : str ) -> bool:
        """Delete a conversation and all its messages.
        
        Args:
            session_id: The conversation session ID.
            
        Returns:
            True if deleted, False if not found.
        """
        try:
            with get_db_connection() as connection:
                with connection.cursor() as cursor:
                    cursor.execute("""
                        DELETE FROM conversations
                        WHERE session_id = %s
                    """, (session_id,))

                    deleted = cursor.rowcount > 0
                    connection.commit()

                    return deleted
                
        except Exception as e:
            raise Exception(f"Database error deleting conversation: {str(e)}") from e
        
    # get lsit of conservations 
    def list_conversations(self, limit: Optional[int] = None) -> List[ConversationDB]:
        """List all conversations.
        
        Args:
            limit: Optional limit on number of conversations to return.
            
        Returns:
            List of ConversationDB instances.
        """

        try:
            with get_db_connection() as connection:
                with connection.cursor() as cursor:
                    query = """
                        SELECT session_id, created_at, updated_at, message_count, metadata
                        FROM conversations
                        ORDER BY updated_at DESC
                    """
                    
                    if limit:
                        query += f" LIMIT {limit}"

                    cursor.execute(query)
                    conversations_rows = cursor.fetchall()

                    return [
                        ConversationDB(
                            session_id=row["session_id"],
                            created_at=row["created_at"],
                            updated_at=row["updated_at"],
                            message_count=row["message_count"],
                            metadata=row["metadata"]
                        )
                        for row in conversations_rows
                    ]  
                
        except Exception as e:
            raise Exception(f"Database error listing conversations: {str(e)}") from e


            
                




# singleton instance
_db_service : Optional[ConversationDatabaseService] = None

def get_conversation_db_service() -> ConversationDatabaseService:
    global _db_service
    if _db_service is None:
        _db_service = ConversationDatabaseService()
    return _db_service    

          