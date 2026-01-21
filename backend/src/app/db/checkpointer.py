"""PostgreSQL-based checkpointer for LangGraph conversation persistence."""
from typing import Optional
import os

from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool
from langgraph.checkpoint.postgres import PostgresSaver

from ..core.config import get_settings

_checkpoint_pool: Optional[ConnectionPool] = None
_checkpointer: Optional[PostgresSaver] = None

def get_checkpoint_pool() -> ConnectionPool:
    global _checkpoint_pool
    if _checkpoint_pool is None:
        settings = get_settings()

        # for Neon ( 1–3 ).
        max_size = int(os.getenv("CHECKPOINT_POOL_MAX_SIZE", "3"))

        _checkpoint_pool = ConnectionPool(
            conninfo=settings.database_url,
            min_size=1,
            max_size=max_size,
            timeout=10.0,

            # recycle connections... so stale ones don't live forever
            max_lifetime=1800, 
            max_idle=300,       
            reconnect_timeout=300,

            kwargs={
                "autocommit": True,
                "row_factory": dict_row,
                "prepare_threshold": 0,
            },
        )
    return _checkpoint_pool


def get_postgres_checkpointer() -> PostgresSaver:
    global _checkpointer
    if _checkpointer is None:
        pool = get_checkpoint_pool()
        _checkpointer = PostgresSaver(pool)
        _checkpointer.setup()
        print("PostgreSQL checkpointer initialized with ConnectionPool")
    return _checkpointer


def close_checkpointer():
    global _checkpointer, _checkpoint_pool
    _checkpointer = None
    if _checkpoint_pool is not None:
        _checkpoint_pool.close()
        _checkpoint_pool = None