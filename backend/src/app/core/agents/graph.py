"""LangGraph orchestration for the linear multi-agent QA flow."""
from typing import Any,Dict
from functools import lru_cache

from langgraph.graph import StateGraph
from langgraph.constants import START, END

from .state import QAState
from .agents import retrieval_node, summarization_node, verification_node

# create graph
def create_qa_graph() -> Any:
    """Create and compile the linear multi-agent QA graph.

    The graph executes in order:
    1. Retrieval Agent: gathers context from vector store
    2. Summarization Agent: generates draft answer from context
    3. Verification Agent: verifies and corrects the answer

    Returns:
        Compiled graph ready for execution.
    """

    # graph state
    # question: str
    # context: str | None
    # draft_answer: str | None
    # answer: str | None    
    builder = StateGraph(QAState)

    # add nodes
    builder.add_node("retrieval", retrieval_node)
    builder.add_node("summarization", summarization_node)
    builder.add_node("verification", verification_node)

    # Define linear flow: START -> retrieval -> summarization -> verification -> END
    builder.add_edge(START, "retrieval")
    builder.add_edge("retrieval", "summarization")
    builder.add_edge("summarization","verification")
    builder.add_edge("verification", END)

    return builder.compile()

# Compile graph (with cache)
@lru_cache(maxsize=1)
def get_qa_graph() -> Any:
    """Get the compiled QA graph instance (singleton via LRU cache)."""
    return create_qa_graph()

# run the qa flow
def run_qa_flow(question : str) -> Dict[str, Any]:
    """Run the complete multi-agent QA flow for a question.

    This is the main entry point for the QA system. It:
    1. Initializes the graph state with the question
    2. Executes the linear agent flow (Retrieval -> Summarization -> Verification)
    3. Extracts and returns the final results

    Args:
        question: The user's question about the vector databases paper.

    Returns:
        Dictionary with keys:
        - `answer`: Final verified answer
        - `draft_answer`: Initial draft answer from summarization agent
        - `context`: Retrieved context from vector store
    """

    graph = get_qa_graph()

    # initial state
    initial_state: QAState = {
        "question": question,
        "context": None,
        "draft_answer": None,
        "answer": None,
    }

    # 1. Create an internal execution context
    # 2. Store initial_state as the current graph state
    # 3. Look for START edge
    # 4. Find the first node connected to START
    # 5. Call that node with the current state

    final_state = graph.invoke(initial_state)
    print("-- Final state of the 'run_qa_flow' : ", final_state)

    return final_state

