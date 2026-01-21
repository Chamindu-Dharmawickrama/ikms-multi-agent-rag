def is_connection_closed_error(e: Exception) -> bool:
    msg = str(e).lower()
    return ("connection is closed" in msg) or ("terminating connection" in msg)

def reset_graph_cache():
    from .graph import get_qa_graph
    get_qa_graph.cache_clear()