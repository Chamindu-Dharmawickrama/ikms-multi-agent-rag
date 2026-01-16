"""Database models for conversation storage in PostgreSQL."""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class MessageDB(BaseModel):
    """Database model for a single message."""
    
    id: Optional[int] = None
    session_id: str
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict) 


class ConversationDB(BaseModel):
    """Database model for a conversation session."""

    session_id : str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    message_count : int = 0
    metadata: Dict[str, Any] = Field(default_factory=dict) 
    messages : List[MessageDB] = Field(default_factory=list)
