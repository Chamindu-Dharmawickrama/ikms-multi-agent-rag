# Use official Python runtime as base image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p data/uploads

# Expose port (Railway will set PORT env variable)
EXPOSE 8000

# Start command - Use shell form to properly expand PORT variable
CMD sh -c "uvicorn src.app.main:server --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers --timeout-keep-alive 30"
