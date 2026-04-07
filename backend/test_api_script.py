from fastapi.testclient import TestClient
from main import app
import json
import traceback

try:
    client = TestClient(app)
    response = client.get("/api/products")
    with open("test_api.txt", "w") as f:
        f.write(f"STATUS: {response.status_code}\n")
        f.write(f"RESPONSE: {response.text[:500]}\n")
except Exception as e:
    with open("test_api.txt", "w") as f:
        f.write(f"ERROR: {str(e)}\n{traceback.format_exc()}")
