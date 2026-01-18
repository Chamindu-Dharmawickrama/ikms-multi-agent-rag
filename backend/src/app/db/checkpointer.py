"""PostgreSQL-based checkpointer for LangGraph conversation persistence."""

import psycopg
from langgraph.checkpoint.postgres import PostgresSaver
from ..core.config import get_settings

_checkpointer = None
_connection = None

def get_postgres_checkpointer() -> PostgresSaver:
    """Get or create the PostgreSQL checkpointer for LangGraph.
    
    This checkpointer automatically handles conversation state persistence
    using PostgreSQL instead of in-memory storage.
    
    Returns:
        PostgresSaver instance configured with Neon database connection.
    """

    global _checkpointer, _connection
    if _checkpointer is None:
        settings = get_settings()

        _connection = psycopg.connect(settings.database_url, autocommit=True)

        # Initialize PostgresSaver with the connection
        _checkpointer = PostgresSaver(_connection)

        _checkpointer.setup()
        print("PostgreSQL checkpointer initialized !")

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