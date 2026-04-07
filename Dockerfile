FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-tk \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install fastapi uvicorn[standard] python-multipart

# Copy project files
COPY . .

# Expose port for dev server
EXPOSE 8456

# Start dev server with reload
CMD ["uvicorn", "backend.dev_server:app", "--host", "0.0.0.0", "--port", "8456", "--reload"]

