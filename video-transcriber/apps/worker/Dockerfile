FROM python:3.11-slim
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY pyproject.toml .
RUN pip install --upgrade pip && pip install -e .
COPY src ./src
CMD ["python","src/main.py"]
