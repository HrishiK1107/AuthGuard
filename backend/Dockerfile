FROM python:3.11-slim

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
 && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY . .

# Expose FastAPI port
EXPOSE 8000

# ✅ FIXED ENTRYPOINT (THIS WAS THE BUG)
CMD ["uvicorn", "api.app:app", "--host", "0.0.0.0", "--port", "8000"]
