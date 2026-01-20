"""LangGraph orchestration for the linear multi-agent QA flow."""
from typing import Any,Dict
from functools import lru_cache

from langgraph.graph import StateGraph
from langgraph.constants import START, END

from .state import QAState
from .agents import retrieval_node, summarization_node, verification_node, memory_summarizer_node
from ...db.checkpointer import get_postgres_checkpointer

# create graph
def create_qa_graph() -> Any:
    """Create and compile the linear multi-agent QA graph.

    The graph executes in order:
    1. Retrieval Agent: gathers context from vector store
    2. Summarization Agent: generates draft answer from context
    3. Verification Agent: verifies and corrects the answer
    4. Memory Summarizer: compresses long conversation histories (optional)

    Uses PostgreSQL checkpointer for persistent conversation history across turns and sessions.

    Returns:
        Compiled graph ready for execution with PostgreSQL checkpointer.
    """

    # graph state
    # question: str
    # context: str | None
    # draft_answer: str | None
    # answer: str | None    
    # conversation_history: str | None
    # conversation_summary: str | None
    builder = StateGraph(QAState)

    # add nodes
    builder.add_node("retrieval", retrieval_node)
    builder.add_node("summarization", summarization_node)
    builder.add_node("verification", verification_node)
    builder.add_node("memory_summarizer", memory_summarizer_node)

    # Define linear flow: START -> retrieval -> summarization -> verification -> memory_summarizer -> END
    builder.add_edge(START, "retrieval")
    builder.add_edge("retrieval", "summarization")
    builder.add_edge("summarization","verification")
    builder.add_edge("verification", "memory_summarizer")
    builder.add_edge("memory_summarizer", END)

    # Compile with PostgreSQL checkpointer for persistent conversation storage
    checkpointer = get_postgres_checkpointer()
    return builder.compile(checkpointer=checkpointer)

# Compile graph (with cache)
@lru_cache(maxsize=1)
def get_qa_graph() -> Any:
    """Get the compiled QA graph instance (singleton via LRU cache)."""
    return create_qa_graph()

# run the qa flow
def run_qa_flow(question : str) -> Dict[str, Any]:
    """Run the complete multi-agent QA flow for a single question without memory.

    This is the entry point for stateless QA. It:
    1. Initializes the graph state with the question
    2. Executes the linear agent flow (Retrieval -> Summarization -> Verification)
    3. Extracts and returns the final results

    Uses a unique thread_id to avoid conversation history.

    Args:
        question: The user's question about the vector databases paper.

    Returns:
        Dictionary with keys:
        - `answer`: Final verified answer
        - `draft_answer`: Initial draft answer from summarization agent
        - `context`: Retrieved context from vector store
    """

    import uuid

    graph = get_qa_graph()

    # initial state
    initial_state: QAState = {
        "question": question,
        "context": None,
        "draft_answer": None,
        "answer": None,
        "conversation_history" : None,
        "conversation_summary": None,
    }

    # 1. Create an internal execution context
    # 2. Store initial_state as the current graph state
    # 3. Look for START edge
    # 4. Find the first node connected to START
    # 5. Call that node with the current state

    config = {"configurable": {"thread_id": str(uuid.uuid4())}}

    final_state = graph.invoke(initial_state, config)
    print("-- Final state of the 'run_qa_flow' : ", final_state)

    return final_state


# run_qa_flow_with_history
def run_qa_flow_with_history(question: str, thread_id: str, file_id: str = None) -> Dict[str, Any]:
    """Run the multi-agent QA flow with conversation history using LangGraph's MemorySaver.

    This is the entry point for conversational multi-turn QA. It:
    1. Loads previous conversation history from MemorySaver using thread_id
    2. Initializes the graph state with the question AND previous history
    3. Uses file_id (if provided) to limit retrieval to a specific uploaded file
    4. Executes the linear agent flow (Retrieval -> Summarization -> Verification)
    5. LangGraph automatically saves the updated conversation state
    6. Returns the final results
    
    The conversation_history is preserved across turns by loading it from
    the checkpointer and passing it in the initial state.

    Args:
        question: The user's current question.
        thread_id: Unique identifier for the conversation thread (session_id).
        file_id: Optional file identifier to limit search to a specific uploaded file.

    Returns:
        Dictionary with keys:
        - `answer`: Final verified answer
        - `draft_answer`: Initial draft answer from summarization agent
        - `context`: Retrieved context from vector store
        - `conversation_history`: The conversation history used (if any)
    """

    graph = get_qa_graph()
    config = {"configurable": {"thread_id": thread_id}}

    # Load previous conversation history from checkpointer 
    previous_history = ""
    previous_summary = ""
    previous_file_id = file_id

    try:
       previous_state = graph.get_state(config)
       if previous_state and previous_state.values:
           previous_history = previous_state.values.get("conversation_history", "")
           previous_summary = previous_state.values.get("conversation_summary", "")
           if not file_id:
               previous_file_id = previous_state.values.get("file_id")
           print(f"-- Loaded previous history (length: {len(previous_history)} chars)")
           if previous_summary:
              print(f"-- Loaded previous summary (length: {len(previous_summary)} chars)")
    except Exception as e:
        print(f"-- No previous history found for thread {thread_id}: {e}")   

    # Initial state with preserved conversation history and summary
    initial_state: QAState = {
        "question": question,
        "context": None,
        "draft_answer": None,
        "answer": None,
        "conversation_history": previous_history,  
        "conversation_summary": previous_summary,  
        "file_id": previous_file_id,
    } 

    # the updated state saved to the PostgreSQL db 
    final_state = graph.invoke(initial_state, config)
    print(f"-- Final state of 'run_qa_flow_with_history' (thread={thread_id}): ", final_state)

    return final_state

def get_conversation_state(thread_id: str) -> Dict[str, Any] | None:
    """Retrieve the current conversation state for a thread.
    
    Args:
        thread_id: The conversation thread identifier.
        
    Returns:
        The latest state snapshot or None if thread doesn't exist.
    """

    graph = get_qa_graph()
    config = {"configurable": {"thread_id": thread_id}}

    try:
        state = graph.get_state(config)
        return state.values if state else None
    
    except Exception as e:
        print(f"-- Error getting conversation state for thread {thread_id}: {e}")
        return None
