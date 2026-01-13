"""Agent implementations for the multi-agent RAG flow.

This module defines three LangChain agents (Retrieval, Summarization,
Verification) and thin node functions that LangGraph uses to invoke them.
"""

from typing import List

from langchain.agents import create_agent
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage

from .prompts import RETRIEVAL_SYSTEM_PROMPT, SUMMARIZATION_SYSTEM_PROMPT, VERIFICATION_SYSTEM_PROMPT
from ..llm.factory import create_chat_model
from .state import QAState
from .tools import retrieval_tool

def _extract_last_ai_content(messages: List[object]) -> str:
    """Extract the content of the last AIMessage in a messages list."""
    for msg in reversed(messages):
        if isinstance(msg, AIMessage):
            return str(msg.content)
    return ""

# retrieval_agent
retrieval_agent = create_agent(
    model=create_chat_model(),
    tools=[retrieval_tool],
    system_prompt=RETRIEVAL_SYSTEM_PROMPT
)

# summarization_agent
summarization_agent = create_agent(
    model=create_chat_model(),
    tools=[],
    system_prompt=SUMMARIZATION_SYSTEM_PROMPT
)

# verification_agent
verification_agent = create_agent(
    model=create_chat_model(),
    tools=[],
    system_prompt=VERIFICATION_SYSTEM_PROMPT
)

# retrieval_agent node
def retrieval_node(state: QAState) -> QAState:
    """Retrieval Agent node: gathers context from vector store.

    This node:
    - Sends the user's question to the Retrieval Agent.
    - The agent uses the attached retrieval tool to fetch document chunks.
    - Extracts the tool's content (CONTEXT string) from the ToolMessage.
    - Stores the consolidated context string in `state["context"]`.
    """
    question = state['question']

    # execute the retrieval_agent with the user msg
    result = retrieval_agent.invoke({"messages":[HumanMessage(content=question)]})
    print("-- retrieval_agent_node result : ", result)

    messages = result.get("messages",[])
    print("-- retrieval_agent_node messages : ", messages)

    context = ""

    for msg in reversed(messages):
        # is msg an object created from the ToolMessage class?
        if isinstance(msg, ToolMessage):
            context = str(msg.content)
            break

    print("-- retrieval_agent_node output CONTEXT (ToolMessage): ", context)    

    # Node functions return partial state updates, not full state
    # new_state = {
    #   "question": question,
    #   "context": context,          # updated
    #   "draft_answer": None,
    #   "answer": None
    #}
    return {
        "context" : context
    }   

# summarization agent node
def summarization_node(state: QAState) -> QAState:
    """Summarization Agent node: generates draft answer from context.

    This node:
    - Sends question + context to the Summarization Agent.
    - Agent responds with a draft answer grounded only in the context.
    - Stores the draft answer in `state["draft_answer"]`.
    """

    print("-- State in the summarization_node : ", state)

    question = state.get("question", "")
    context = state.get("context", "")
    
    if not context:
        print("WARNING: Context is empty or None!")
    print("--- context : ",context)

    user_content = f"Question: {question} \n\nContext:\n{context}"

    # pass the question and retrieved chunks to the summarization_agent and execute
    result = summarization_agent.invoke({"messages": HumanMessage(content=user_content)})

    messages = result.get("messages", [])
    draft_answer = _extract_last_ai_content(messages)
    print("-- Summarization_node (Draft Answer) : ", draft_answer)

    return {
        "draft_answer": draft_answer,
    }

# the verification agent node
def verification_node(state: QAState) -> QAState:
    """Verification Agent node: verifies and corrects the draft answer.

    This node:
    - Sends question + context + draft_answer to the Verification Agent.
    - Agent checks for hallucinations and unsupported claims.
    - Stores the final verified answer in `state["answer"]`.
    """

    question = state.get("question", "")
    context = state.get("context", "")
    draft_answer = state.get("draft_answer")

    user_content = f"""Question: {question}
    Context:
    {context}

    Draft_answer:
    {draft_answer}

    Please verify and correct the draft answer, removing any unsupported claims."""

    # pass the question, retrieved chunks and generated draft answer to the verification_agent and execute
    result = verification_agent.invoke({"messages": HumanMessage(content=user_content)})

    messages = result.get("messages", [])
    answer = _extract_last_ai_content(messages)

    return {
        "answer": answer
    }
