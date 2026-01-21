"""Database models for conversation storage in PostgreSQL."""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class FileDB(BaseModel):
    """Database model for an uploaded file."""
    
    file_id: str
    filename: str
    file_path: Optional[str] = None
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class MessageDB(BaseModel):
    """Database model for a single message."""
    
    id: Optional[int] = None
    session_id: str
    role: str  # "USER" or "Assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict) 


class ConversationDB(BaseModel):
    """Database model for a conversation session."""

    session_id : str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    message_count : int = 0
    active_file_id: Optional[str] = None
    filename: Optional[str] = None  
    metadata: Dict[str, Any] = Field(default_factory=dict) 
    messages : List[MessageDB] = Field(default_factory=list)
