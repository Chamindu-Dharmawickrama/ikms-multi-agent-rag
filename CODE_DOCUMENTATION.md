# How the IKMS AI System Works

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [The Big Picture](#the-big-picture)
3. [Part 1: Uploading a Document](#part-1-uploading-a-document)
4. [Part 2: Asking Your First Question](#part-2-asking-your-first-question)
5. [Part 3: The Four AI Agents](#part-3-the-four-ai-agents)
6. [Part 4: How the Graph Runs](#part-4-how-the-graph-runs)
7. [Part 5: Continuing the Conversation](#part-5-continuing-the-conversation)
8. [Summary](#summary)

---

## Tech Stack

The IKMS AI System is built using modern technologies across the backend, frontend, and infrastructure:

### Backend Technologies

- **Python** (≥3.10) - Core programming language
- **FastAPI** - High-performance web framework for building REST APIs
- **Uvicorn** - ASGI server for running the FastAPI application
- **LangChain** - Framework for building LLM applications and chains
- **LangGraph** - Multi-agent workflow orchestration and state management
- **LangChain OpenAI** - Integration with OpenAI's language models
- **Pinecone** - Cloud-based vector database for semantic search
- **PostgreSQL** - Relational database for conversation persistence
- **psycopg** - PostgreSQL adapter with connection pooling
- **PyPDF** - Library for PDF document parsing and text extraction
- **Pydantic** - Data validation and settings management

### Frontend Technologies

- **React** (v19.2) - Modern UI library for building interactive interfaces
- **TypeScript** (v5.9) - Type-safe JavaScript for robust development
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing and navigation
- **Redux Toolkit** - Centralized state management
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Axios** - HTTP client for API communication
- **Lucide React** - Icon library for UI elements

### DevOps & Infrastructure

- **Docker** - Containerization for consistent deployment
- **Railway** - Cloud platform for deployment and hosting
- **Python dotenv** - Environment variable management
- **ESLint** - Code quality and linting for TypeScript/JavaScript

### Why These Technologies?

- **FastAPI + LangChain**: Provides a fast, async-capable backend optimized for AI/LLM workflows
- **LangGraph**: Enables sophisticated multi-agent systems with state management and checkpointing
- **Pinecone**: Offers scalable, managed vector search without infrastructure overhead
- **PostgreSQL**: Ensures conversation persistence and enables LangGraph's checkpoint system
- **React + TypeScript**: Delivers a type-safe, component-based UI with excellent developer experience
- **Vite**: Provides lightning-fast development with hot module replacement

---

## The Big Picture

### The Flow

```
You Upload PDF
    ↓
System Reads & Stores It
    ↓
You Ask Question
    ↓
Agent 1: Finds Relevant Information
    ↓
Agent 2: Writes Answer
    ↓
Agent 3: Checks Accuracy
    ↓
Agent 4: Saves Conversation
    ↓
You Get Verified Answer
```

---

## Part 1: Uploading a Document

### What Happens Step-by-Step

#### Step 1: You Upload a PDF

```
Your Action: Click "Upload" → Select "Research_Paper.pdf"
```

#### Step 2: System Reads the PDF

```
What Happens:
- Opens the PDF file
- Extracts all the text
- Result: Plain text of your document
```

Example:

```
PDF Content:
"Introduction
Artificial Intelligence has revolutionized many industries.
Vector databases enable semantic search..."

Extracted Text:
"Introduction\nArtificial Intelligence has revolutionized many industries.\nVector databases enable semantic search..."
```

#### Step 3: System Breaks Text into Chunks

```
Why? The document is too large to search effectively.
How? Splits into small pieces (~500 characters each)
```

Your 50-page document becomes:

```
Chunk 1: "Introduction\nArtificial Intelligence has..."
Chunk 2: "...has revolutionized many industries. Vector databases..."
Chunk 3: "...databases enable semantic search. HNSW algorithm..."
...
Chunk 200: "...Conclusion\nThis paper presented..."
```

#### Step 4: System Converts Chunks to Numbers

```
Why? Computers need numbers to search by meaning
How? Uses OpenAI to convert text → 1536 numbers (embedding)
```

Example:

```
Text: "HNSW is a graph-based algorithm"
↓
Numbers: [0.234, -0.567, 0.123, ..., 0.789]
         (1536 numbers total)
```

These numbers represent the **meaning** of the text.

Similar meanings = similar numbers!

#### Step 5: System Stores in Vector Database (Pinecone)

```
What: All chunks + their number representations
Where: Pinecone (cloud vector database)
```

Now your document is **searchable by meaning**!

---

## Part 2: Asking Your First Question

### The Journey of Your Question

Let's follow what happens when you ask:
**"What is HNSW algorithm?"**

### Step 1: Question Reaches the Backend

```
Your typing: "What is HNSW algorithm?"
        ↓
Press Enter
        ↓
Sent to server
```

### Step 2: System Prepares the Pipeline

```
Creates a "State" (like a clipboard to pass between agents):

State = {
    question: "What is HNSW algorithm?",
    context: None,           ← Will be filled by Agent 1
    draft_answer: None,      ← Will be filled by Agent 2
    answer: None,            ← Will be filled by Agent 3
    conversation_history: "" ← Will be updated by Agent 3 & 4
}
```

### Step 3: Graph Starts Running

```
The system has a "graph" - a sequence of agents:

START → Agent 1 → Agent 2 → Agent 3 → Agent 4 → END
```

Each agent:

1. Receives the State
2. Does its job
3. Updates the State
4. Passes it to next agent

---

## Part 3: The Four AI Agents

### Agent 1: The Finder (Retrieval Agent)

**Job**: Find relevant information from your document

**What It Does**:

```
1. Receives: "What is HNSW algorithm?"

2. Converts question to numbers (same way as documents):
   "What is HNSW algorithm?" → [0.235, -0.566, 0.124, ...]

3. Searches Pinecone for similar numbers:
   Finds chunks with similar meaning

4. Gets back top 6 most relevant chunks:
   Chunk 47 (page 5): "HNSW (Hierarchical Navigable Small World)..."
   Chunk 89 (page 7): "The algorithm works by constructing..."
   Chunk 134 (page 12): "HNSW achieves superior performance..."
   ...

5. Updates State:
   State.context = "Chunk 47 (page 5): HNSW is..."
```

**How It Searches**:

```
Your Question Numbers: [0.235, -0.566, 0.124, ...]

Compare with all chunks in database:
Chunk 1: [0.8, 0.3, -0.6, ...]     → Similarity: 12% (not relevant)
Chunk 47: [0.236, -0.565, 0.125, ...] → Similarity: 94% (very relevant!)
Chunk 89: [0.230, -0.570, 0.120, ...] → Similarity: 91% (very relevant!)

Returns: Top 6 most similar chunks
```

**Result**: State now has relevant chunks!

---

### Agent 2: The Writer (Summarization Agent)

**Job**: Read the chunks and write a clear answer

**What It Does**:

```
1. Receives State with:
   - Question: "What is HNSW algorithm?"
   - Context: 6 relevant chunks

2. Sends to ChatGPT with instructions:
   "Read these chunks and answer the question.
    Only use information from the chunks.
    Be clear and concise."

3. ChatGPT reads all chunks and writes answer:
   "HNSW (Hierarchical Navigable Small World) is a graph-based
    algorithm for approximate nearest neighbor search. It constructs
    a multi-layer graph structure where each layer has progressively
    fewer nodes, enabling logarithmic search complexity..."

4. Updates State:
   State.draft_answer = "HNSW is a graph-based algorithm..."
```

**Important Rules**:

- Cannot use outside knowledge
- Cannot make up information
- Only uses what's in the chunks
- If question is unrelated, says so

**Result**: State now has a draft answer!

---

### Agent 3: The Checker (Verification Agent)

**Job**: Make sure the answer is accurate

**What It Does**:

```
1. Receives State with:
   - Question: "What is HNSW algorithm?"
   - Context: Original 6 chunks
   - Draft Answer: "HNSW is a graph-based algorithm..."

2. Sends to ChatGPT with instructions:
   "Compare this draft answer with the original chunks.
    Remove anything not supported by the chunks.
    Fix any inaccuracies."

3. ChatGPT checks each sentence:
   ✓ "HNSW is graph-based" → Found in Chunk 47
   ✓ "multi-layer structure" → Found in Chunk 89
   ✓ "logarithmic complexity" → Found in Chunk 134

4. All claims verified! Answer approved.

5. Updates State:
   State.answer = "HNSW is a graph-based algorithm..."
   State.conversation_history = "User: What is HNSW?\nAssistant: HNSW is..."
```

**What If Something's Wrong?**

Example of bad draft:

```
Draft: "HNSW is the fastest algorithm in the world and used by Google"

Verification:
✓ "HNSW" → Mentioned in chunks
✓ "fastest algorithm" → Found in chunks
✗ "fastest in the world" → NOT in chunks  (removed)
✗ "used by Google" → NOT in chunks  (removed)

Corrected: "HNSW is a fast algorithm for nearest neighbor search"
```

**Result**: State now has verified, accurate answer!

---

### Agent 4: The Memory Keeper (Memory Agent)

**Job**: Manage conversation history efficiently

**What It Does**:

```
1. Receives State with full conversation history

2. Counts how many questions asked:
   Count = 1 question (first question)

3. Checks if conversation is getting long:
   If less than 5 questions → Do nothing
   If 5+ questions → Summarize older conversations

4. Since this is question #1:
   No action needed - history is short

5. State stays same (no updates)
```

**What Happens After 5+ Questions?**

Example with 6 questions:

```
Old History (Questions 1-3):
User: What is HNSW?
Assistant: HNSW is...
User: What is LSH?
Assistant: LSH is...
User: Compare them
Assistant: HNSW is faster...

New History After Summarization:

Summary: "User explored indexing algorithms HNSW and LSH,
         comparing performance and complexity."

Recent (Questions 4-6):
User: What about implementation?
Assistant: Implementation requires...
User: Performance tips?
Assistant: For best performance...
User: Parameter tuning?
Assistant: Key parameters are...
```

**Result**: Conversation stays manageable!

---

## Part 4: How the Graph Runs

### The Graph Structure

Think of it like a factory assembly line:

```
Station 1      Station 2         Station 3         Station 4
(Finder)   →   (Writer)      →   (Checker)     →   (Memory)
   ↓              ↓                 ↓                 ↓
Find Info    Write Answer    Check Accuracy    Save History
```

### Execution Flow

**LangGraph** is the system that runs this assembly line.

#### Step 1: Initialize

```python
# Create the State clipboard
state = {
    question: "What is HNSW algorithm?",
    context: None,
    draft_answer: None,
    answer: None,
    conversation_history: ""
}
```

#### Step 2: Run Agent 1

```python
# LangGraph calls Agent 1
state = retrieval_agent(state)

# State after Agent 1:
state = {
    question: "What is HNSW algorithm?",
    context: "Chunk 47: HNSW is...",  ← UPDATED
    draft_answer: None,
    answer: None,
    conversation_history: ""
}
```

#### Step 3: Run Agent 2

```python
# LangGraph automatically passes updated state to Agent 2
state = summarization_agent(state)

# State after Agent 2:
state = {
    question: "What is HNSW algorithm?",
    context: "Chunk 47: HNSW is...",
    draft_answer: "HNSW is a graph-based...",  ← UPDATED
    answer: None,
    conversation_history: ""
}
```

#### Step 4: Run Agent 3

```python
# LangGraph passes state to Agent 3
state = verification_agent(state)

# State after Agent 3:
state = {
    question: "What is HNSW algorithm?",
    context: "Chunk 47: HNSW is...",
    draft_answer: "HNSW is a graph-based...",
    answer: "HNSW is a graph-based...",  ← UPDATED
    conversation_history: "User: What is HNSW?\nAssistant: ..."  ← UPDATED
}
```

#### Step 5: Run Agent 4

```python
# LangGraph passes state to Agent 4
state = memory_agent(state)

# State after Agent 4:
# (No changes - conversation too short to summarize)
```

#### Step 6: Save & Return

```python
# LangGraph saves state to database
database.save(state)

# Returns final answer to you
return state.answer
```

---

## Part 5: Continuing the Conversation

### Second Question: "How does it compare to LSH?"

Now you ask a follow-up question. What changes?

### Step 1: Load Previous State

```python
# LangGraph loads from database
previous_state = {
    conversation_history: "User: What is HNSW?\nAssistant: HNSW is..."
}
```

### Step 2: Create New State

```python
new_state = {
    question: "How does it compare to LSH?",
    context: None,
    draft_answer: None,
    answer: None,
    conversation_history: previous_state.conversation_history  ← FROM DATABASE
}
```

### Step 3: Agent 1 with Context

```python
# Agent 1 now sees the conversation history!

Search Query Built:
"Previous conversation:
 User asked about HNSW, learned it's a graph-based algorithm.

 Current question: How does it compare to LSH?"

# Searches for chunks about BOTH HNSW and LSH comparison
```

### Step 4: Agent 2 with Context

```python
# Agent 2 reads:
# - New question: "How does it compare to LSH?"
# - Retrieved chunks: About HNSW and LSH comparison
# - Conversation history: Previous discussion about HNSW

# Writes answer that makes sense in context:
"Compared to the HNSW algorithm we discussed earlier, LSH (Locality
Sensitive Hashing) uses a different approach..."
```

### Key Difference

```
First Question:
- No history
- Fresh search
- General answer

Follow-up Question:
- Has history
- Context-aware search
- Connected answer
```

### After 6 Questions

```
State Before Memory Agent:
conversation_history = "
User: What is HNSW?
Assistant: HNSW is...
User: What is LSH?
Assistant: LSH is...
User: Compare them
Assistant: HNSW is faster...
User: Implementation?
Assistant: Implementation requires...
User: Performance?
Assistant: For best performance...
User: Parameters?
Assistant: Key parameters...
"

Memory Agent Actions:
1. Counts: 6 questions (> 5 threshold)
2. Keeps last 3 Q&A (recent)
3. Summarizes first 3 Q&A

State After Memory Agent:
conversation_summary = "User explored HNSW and LSH algorithms, comparing performance."
conversation_history = "
User: Implementation?
Assistant: Implementation requires...
User: Performance?
Assistant: For best performance...
User: Parameters?
Assistant: Key parameters...
"

Next question will use: summary + recent history
```

---

## Common Questions

**Q: What if the document doesn't have the answer?**  
A: Agent 2 returns: "I cannot answer this question as it is not related to the available document content."

**Q: Can it use internet or other knowledge?**  
A: No. It ONLY uses your uploaded documents. This prevents hallucinations.

**Q: How long do conversations last?**  
A: Forever! State is saved to database, you can continue anytime.

**Q: What if I upload multiple documents?**  
A: Each conversation is locked to ONE document for clarity.

**Q: What if agents disagree?**  
A: They don't! Each agent transforms the state. Agent 3 always has final say.

---

## References

**Author**: Chamindu Dharmawickrama  
**Project**: IKMS Multi-Agent RAG System  
**Date**: 2026/01/21

---
