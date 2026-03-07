FROM python:3.12-alpine
RUN pip install --no-cache-dir flask
COPY server.py /app/server.py
WORKDIR /app
EXPOSE 5000
CMD ["python", "server.py"]
