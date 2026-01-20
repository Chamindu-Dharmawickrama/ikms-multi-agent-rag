"""PostgreSQL-based checkpointer for LangGraph conversation persistence."""

import psycopg
from langgraph.checkpoint.postgres import PostgresSaver
from ..core.config import get_settings

_checkpointer = None
_connection = None

def _create_connection():
    """Create a new PostgreSQL connection for the checkpointer."""
    settings = get_settings()
    
    conn = psycopg.connect(
        settings.database_url,
        autocommit=True,
        prepare_threshold=0,  
    )
    
    return conn

def get_postgres_checkpointer() -> PostgresSaver:
    """Get or create the PostgreSQL checkpointer for LangGraph.
    
    This checkpointer automatically handles conversation state persistence
    using PostgreSQL instead of in-memory storage.
    
    Returns:
        PostgresSaver instance configured with Neon database connection.
    """

    global _checkpointer, _connection
    
    # Always check connection health before use
    if _connection is not None:
        try:
            # Test if connection is still alive
            with _connection.cursor() as cur:
                cur.execute("SELECT 1")
        except Exception as e:
            # Connection is dead, reset it
            print(f"PostgreSQL checkpointer connection dead ({e}), recreating...")
            try:
                _connection.close()
            except:
                pass
            _connection = None
            _checkpointer = None
    
    if _checkpointer is None:
        _connection = _create_connection()

        # Initialize PostgresSaver with the connection
        _checkpointer = PostgresSaver(_connection)

        _checkpointer.setup()
        print("PostgreSQL checkpointer initialized!")

    return _checkpointer


def close_checkpointer():
    """Close the checkpointer connection.
    
    Should be called on application shutdown.
    """    

    global _checkpointer, _connection
    if _connection is not None:
        _connection.close()
        _connection = None
    if _checkpointer is not None:
        _checkpointer = None