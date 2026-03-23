"""Database connection management for PostgreSQL."""

from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool
from typing import Optional
from ..core.config import get_settings
import psycopg
import os

# Global connection pool
_connection_pool: Optional[ConnectionPool] = None

# create a connection with the db
def get_connection_pool() -> ConnectionPool:
    """Get or create the PostgreSQL connection pool.
    
    Returns:
        ConnectionPool instance for managing database connections.
    """

    global _connection_pool
    if _connection_pool is None:
        settings = get_settings()
        
        min_pool_size = int(os.getenv("DB_POOL_MIN_SIZE", "1"))
        max_pool_size = int(os.getenv("DB_POOL_MAX_SIZE", "5"))
        
        _connection_pool = ConnectionPool(
            conninfo=settings.database_url,
            min_size=min_pool_size,
            max_size=max_pool_size,
            kwargs={"row_factory": dict_row},
            # Add connection check for auto-reconnect
            check=ConnectionPool.check_connection,
            # Add timeout for faster failure detection
            timeout=5.0,
        )

    return _connection_pool  

# get the connection with the db 
def get_db_connection():
    """Get a database connection from the pool.
    
    Usage:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM conversations")
    
    Returns:
        Context manager for database connection.
    """

    pool = get_connection_pool()
    return pool.connection()

# initial database creation (one time on server started)
def init_database():
    """Initialize the database schema for conversations and messages.
    
    Creates the necessary tables if they don't exist:
    - users: stores user information from Google OAuth
    - conversations: stores conversation metadata
    - messages: stores individual messages within conversations
    """

    with get_db_connection() as connection:
        with connection.cursor() as cursor:

            # Create users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    user_id VARCHAR(255) PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    name VARCHAR(500),
                    picture VARCHAR(1000),
                    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                    last_login TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                    metadata JSONB DEFAULT '{}'::jsonb
                )
            """)

            # Create files table for tracking uploaded documents
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS files (
                    file_id VARCHAR(255) PRIMARY KEY,
                    filename VARCHAR(500) NOT NULL,
                    file_path VARCHAR(1000),
                    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                    user_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE,
                    metadata JSONB DEFAULT '{}'::jsonb
                )
            """)

            # Create conversations table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS conversations (
                    session_id VARCHAR(255) PRIMARY KEY,
                    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                    message_count INTEGER DEFAULT 0,
                    active_file_id VARCHAR(255) REFERENCES files(file_id) ON DELETE SET NULL,
                    user_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE,
                    metadata JSONB DEFAULT '{}'::jsonb
                )
            """)

            cursor.execute("""
                DO $$ BEGIN
                    CREATE TYPE message_role AS ENUM ('USER', 'Assistant', 'SYSTEM');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            """)
            
            # Create messages table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id SERIAL PRIMARY KEY,
                    session_id VARCHAR(255) NOT NULL REFERENCES conversations(session_id) ON DELETE CASCADE,
                    role message_role NOT NULL,
                    content TEXT NOT NULL,
                    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                    metadata JSONB DEFAULT '{}'::jsonb
                )
            """)

            # Create index on session_id for faster message queries
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_messages_session_id 
                ON messages(session_id)
            """)
            
            # Create index on timestamp for ordered retrieval
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_messages_timestamp 
                ON messages(timestamp)
            """)
            
            # Migration: Add user_id column to existing tables if they don't have it
            # Check and add user_id to files table
            cursor.execute("""
                DO $$ 
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'files' AND column_name = 'user_id'
                    ) THEN
                        ALTER TABLE files ADD COLUMN user_id VARCHAR(255);
                        ALTER TABLE files ADD CONSTRAINT files_user_id_fkey 
                            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
                    END IF;
                END $$;
            """)
            
            # Check and add user_id to conversations table
            cursor.execute("""
                DO $$ 
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'conversations' AND column_name = 'user_id'
                    ) THEN
                        ALTER TABLE conversations ADD COLUMN user_id VARCHAR(255);
                        ALTER TABLE conversations ADD CONSTRAINT conversations_user_id_fkey 
                            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
                    END IF;
                END $$;
            """)
            
            # Performance optimization indexes
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_conversations_updated_at 
                ON conversations(updated_at DESC)
            """)
            
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_conversations_active_file_id 
                ON conversations(active_file_id)
            """)
            
            # Add indexes for user-specific queries
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_files_user_id 
                ON files(user_id)
            """)
            
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_conversations_user_id 
                ON conversations(user_id)
            """)
            
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_users_email 
                ON users(email)
            """)
            
            connection.commit()
            print("Database connected and tables initialized successfully")


# close the db connection (When server shutdown)
def close_connection_pool():
    """Close the connection pool gracefully.
    
    Should be called on application shutdown.
    """
    global _connection_pool
    if _connection_pool is not None:
        _connection_pool.close()
        _connection_pool = None
