# User Guide - IKMS Multi-Agent RAG System

## Prerequisites

Before starting, make sure you have installed:

- **uv** (Python package and project manager) - [Install uv](https://docs.astral.sh/uv/getting-started/installation/)
- **Node.js 18 or higher**
- **npm** (comes with Node.js)

> **Note**: `uv` is a fast Python package and project manager that replaces pip and virtual environment tools. It automatically manages Python versions and dependencies.

---

## Step 1: Clone the Project

```bash
git clone <repository-url>
cd ikms-multi-agent-rag
```

---

## Step 2: Set Up Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend/` folder:

```bash
cd backend
```

Create `.env` file with the following content:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL_NAME=gpt-4o-mini
OPENAI_EMBEDDING_MODEL_NAME=text-embedding-3-small

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=your_index_name_here

# PostgreSQL Database (Neon)
DATABASE_URL=postgresql://username:password@host/database

# Retrieval Settings
RETRIEVAL_K=4
```

**Where to get these values:**

- `OPENAI_API_KEY`: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- `PINECONE_API_KEY`: Get from [Pinecone Console](https://app.pinecone.io/)
- `PINECONE_INDEX_NAME`: Create an index in Pinecone (dimension: 1536, metric: cosine)
- `DATABASE_URL`: Get from [Neon](https://neon.tech/) or any PostgreSQL provider

### Frontend Environment Variables

Create a `.env` file in the `frontend/` folder:

```bash
cd ../frontend
```

Create `.env` file with:

```env
VITE_API_URL=http://localhost:8000
```

---

## Step 3: Install Dependencies

### Backend Dependencies

Using `uv` (recommended - fast and automatic):

```bash
cd backend

# uv will automatically:
# - Install the correct Python version if needed
# - Create a virtual environment
# - Install all dependencies from requirements.txt
uv sync
```

> **What does `uv sync` do?**
>
> - Detects and installs Python 3.10+ if not available
> - Creates a `.venv` folder with an isolated environment
> - Installs all packages from `requirements.txt`
> - Much faster than traditional pip install

### Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## Step 4: Run the Application

### Start the Backend Server

Open a terminal in the `backend/` folder:

```bash
cd backend

# Run the server with uv
uv run uvicorn src.app.main:app --reload --port 8000
```

> **Note**: `uv run` automatically activates the virtual environment and runs the command. No need to manually activate!

You should see:

```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

Backend is now running at **http://localhost:8000**

### Start the Frontend Development Server

Open another terminal in the `frontend/` folder:

```bash
cd frontend
npm run dev
```

You should see:

```
  VITE v7.2.4  ready in 500 ms

  ➜  Local:   http://localhost:5173/
```

Frontend is now running at **http://localhost:5173**

---

## Step 5: Use the Application

1. Open your browser and go to **http://localhost:5173**
2. Upload a PDF document
3. Wait for indexing to complete
4. Start asking questions about your document
5. The AI will answer based on the document content

---

## Troubleshooting

### Backend Issues

**"Module not found" error**

- Make sure you ran `uv sync` in the backend folder
- Try running `uv sync --reinstall` to reinstall dependencies

**"Connection error" to database**

- Verify `DATABASE_URL` in `.env` is correct
- Make sure your database is accessible

**"Invalid API key" for OpenAI/Pinecone**

- Double-check your API keys in `.env`
- Make sure there are no extra spaces or quotes

**"uv: command not found"**

- Install uv:
    - Windows: `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`
    - Mac/Linux: `curl -LsSf https://astral.sh/uv/install.sh | sh`
- Restart your terminal after installation

### Frontend Issues

**"Cannot connect to backend"**

- Make sure backend is running on port 8000
- Check `VITE_API_URL` in frontend `.env` file

**Blank page or errors**

- Run `npm install` again
- Clear browser cache and reload

---

## Quick Start Summary

```bash
# 1. Setup Backend
cd backend
# Create .env with your API keys
uv sync
uv run uvicorn src.app.main:app --reload --port 8000

# 2. Setup Frontend (in another terminal)
cd frontend
# Create .env with VITE_API_URL=http://localhost:8000
npm install
npm run dev

# 3. Open browser
# Go to http://localhost:5173
```

That's it! You're ready to use the IKMS Multi-Agent RAG System.
