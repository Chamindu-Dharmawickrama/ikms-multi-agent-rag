"""Agent implementations for the multi-agent RAG flow.

This module defines three LangChain agents (Retrieval, Summarization,
Verification) and thin node functions that LangGraph uses to invoke them.
"""

from typing import List

from langchain.agents import create_agent
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage

from .prompts import (
    RETRIEVAL_SYSTEM_PROMPT,
    SUMMARIZATION_SYSTEM_PROMPT,
    VERIFICATION_SYSTEM_PROMPT,
    MEMORY_SUMMARIZATION_SYSTEM_PROMPT
)    
from ..llm.factory import create_chat_model
from .state import QAState
from .tools import retrieval_tool

def _extract_last_ai_content(messages: List[object]) -> str:
    """Extract the content of the last AIMessage in a messages list."""
    for msg in reversed(messages):
        if isinstance(msg, AIMessage):
            return str(msg.content)
    return ""

def _build_conversation_context(state: QAState):
    """Build optimized conversation context using summary + ALL recent history.
    
    Strategy:
    - If conversation_summary exists: Use summary + ALL current conversation_history
    - Otherwise: Use full conversation_history
    
    This ensures NO turns are ever dropped while still optimizing token usage.
    The memory_summarizer_node handles truncation AFTER summarization.
    """
    conversation_history = state.get("conversation_history", '')
    conversation_summary = state.get("conversation_summary", '')

    # If we have a summary, combine it with ALL current history
    if conversation_summary:
        if conversation_history:
            print(f"-- _build_conversation_context: Using summary ({len(conversation_summary)} chars) + ALL recent history ({len(conversation_history)} chars)")
            return f"[Previous Context Summary]\n{conversation_summary}\n\n[Recent Conversation]\n{conversation_history}"
        else:
            print(f"-- _build_conversation_context: Using summary only ({len(conversation_summary)} chars)")
            return f"[Previous Context Summary]\n{conversation_summary}"

    if conversation_history:
        print(f"-- _build_conversation_context: Using full history ({len(conversation_history)} chars)")
        return conversation_history
    
    print("-- _build_conversation_context: No history or summary found")
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

# memory_summarization_agent
memory_summarization_agent = create_agent(
    model=create_chat_model(),
    tools=[],
    system_prompt=MEMORY_SUMMARIZATION_SYSTEM_PROMPT
)

# retrieval_agent node
def retrieval_node(state: QAState) -> QAState:
    """Retrieval Agent node: gathers context from vector store.

    This node:
    - Sends the user's question to the Retrieval Agent.
    - Considers conversation history for better query formulation.
    - The agent uses the attached retrieval tool to fetch document chunks.
    - Extracts the tool's content (CONTEXT string) from the ToolMessage.
    - Stores the consolidated context string in `state["context"]`.
    """
    question = state['question']
    conversation_context = _build_conversation_context(state)

    # Build enhanced query with conversation 
    query_message = question
    if conversation_context:
        query_message = f"Conversation History:\n{conversation_context}\n\nCurrent Question: {question}"

    # execute the retrieval_agent with the user msg
    result = retrieval_agent.invoke({"messages":[HumanMessage(content=query_message)]})

    messages = result.get("messages",[])
    print("-- retrieval_agent_node messages : ", messages)

    context = ""

    for msg in reversed(messages):
        # is msg an object created from the ToolMessage class?
        if isinstance(msg, ToolMessage):
            context = str(msg.content)
            break

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
    - Sends question + context + conversation history to the Summarization Agent.
    - Agent responds with a draft answer grounded only in the context.
    - Stores the draft answer in `state["draft_answer"]`.
    """

    print("-- State in the summarization_node : ", state)

    question = state.get("question", "")
    context = state.get("context", "")
    conversation_context = _build_conversation_context(state)
    
    if not context:
        print("WARNING: Context is empty or None!")

    # if conversation_history available send it also to generate answer 
    user_content = f"Question: {question} \n\nContext:\n{context}"
    if conversation_context:
        user_content = f"Conversation History:\n{conversation_context}\n\n{user_content}"

    # pass the question and retrieved chunks to the summarization_agent and execute
    result = summarization_agent.invoke({"messages": [HumanMessage(content=user_content)]})

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
    - Sends question + context + draft_answer + conversation history to the Verification Agent.
    - Agent checks for hallucinations and unsupported claims.
    - Stores the final verified answer in `state["answer"]`.
    - Updates conversation history with the current Q&A turn.
    """

    question = state.get("question", "")
    context = state.get("context", "")
    draft_answer = state.get("draft_answer")
    conversation_context = _build_conversation_context(state)

    user_content = f"""Question: {question}
    Context:
    {context}

    Draft_answer:
    {draft_answer}

    Please verify and correct the draft answer, removing any unsupported claims."""

    if conversation_context:
        user_content = f"Conversation History:\n{conversation_context}\n\n{user_content}"

    # pass the question, retrieved chunks and generated draft answer to the verification_agent and execute
    result = verification_agent.invoke({"messages": [HumanMessage(content=user_content)]})

    messages = result.get("messages", [])
    answer = _extract_last_ai_content(messages)

    # Update conversation history with this turn
    current_history = state.get("conversation_history")
    new_history = current_history
    if new_history:
        new_history += f"\n\nUser: {question}\nAssistant: {answer}"
    else:
        new_history = f"User: {question}\nAssistant: {answer}"    


    return {
        "answer": answer,
        "conversation_history": new_history
    }

# the memory_summarizer node
def memory_summarizer_node(state: QAState) -> dict:
    """Memory Summarization node: compresses conversation history when it gets long.
    
    This node:
    - Parses turns robustly using 'User:' markers to count actual conversation turns.
    - Checks if conversation history has more than 5 turns (configurable threshold).
    - If yes, uses the Memory Summarization Agent to create a concise summary.
    - Stores the summary in conversation_summary field.
    - Truncates old conversation_history, keeping only recent turns.
    - This actively reduces token usage for very long conversations.
    
    The summary is used by all agents via _build_conversation_context() which combines
    summary + ALL current history to ensure NO turns are dropped.
    """

    conversation_history = state.get('conversation_history', '')
    existing_summary = state.get('conversation_summary', '')
    
    if not conversation_history:
        print("-- memory_summarizer_node: No history to summarize")
        return {}
    
    # find how many msg are their
    import re
    user_pattern = r'(?m)^User:\s'
    user_turns = re.split(user_pattern, conversation_history)
    # Filter empty strings and count actual turns
    user_turns = [t.strip() for t in user_turns if t.strip()]
    turn_count = len(user_turns) 

    print(f"-- memory_summarizer_node: Counted {turn_count} turns using User: markers")
    
    #turn_count = conversation_history.count('User:') + conversation_history.count('Assistant:')
    #turn_count = turn_count // 2  
        
    SUMMARIZATION_THRESHOLD = 5
    RECENT_TURNS_TO_KEEP = 3

    if turn_count <= SUMMARIZATION_THRESHOLD:
        print(f"-- memory_summarizer_node: History under threshold ({turn_count} <= {SUMMARIZATION_THRESHOLD}), no summary needed")
        return {}
    
    print(f"-- memory_summarizer_node: History exceeds threshold ({turn_count} > {SUMMARIZATION_THRESHOLD}), generating summary...")

    # Find all positions where "User: " appears (position where the "User: " begins)
    turn_positions = [m.start() for m in re.finditer(user_pattern, conversation_history)]
    
    if len(turn_positions) >= RECENT_TURNS_TO_KEEP:
        truncate_position = turn_positions[-RECENT_TURNS_TO_KEEP]
        recent_history = conversation_history[truncate_position:]
        older_history = conversation_history[:truncate_position].strip()
    else:
        recent_history = conversation_history
        older_history = ""    

    # Nothing to summarize if no older history
    if not older_history:
        print(f"-- memory_summarizer_node: No older history to summarize (only {turn_count} turns)")
        return {}
        
    # Build content to summarize: existing summary (if any) + older history
    content_to_summarize = older_history
    if existing_summary:
        content_to_summarize = f"Previous Summary:\n{existing_summary}\n\nAdditional History:\n{content_to_summarize}"  

    summary_prompt = f"""Summarize the following conversation history concisely:

    {content_to_summarize}

    Provide a brief summary (3-5 sentences) highlighting key topics, questions, and important information discussed."""

    # Generate summary
    result = memory_summarization_agent.invoke({"messages": [HumanMessage(content=summary_prompt)]})

    summary = _extract_last_ai_content(result.get("messages",[]))

    print(f"-- memory_summarizer_node: Generated summary {summary}")

    return {
        "conversation_summary": summary,
        "conversation_history": recent_history
    }