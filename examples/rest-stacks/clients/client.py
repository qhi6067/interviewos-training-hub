# client.py · Python 3 with the requests library
import requests

BASE = "http://127.0.0.1:3001/api/tasks"

response = requests.get(BASE, timeout=5)
response.raise_for_status()  # raises an error for 4xx and 5xx
print(response.json())

created = requests.post(BASE, json={"title": "Practice API integrations"}, timeout=5)
print(created.status_code, created.headers["Location"])
task = created.json()

updated = requests.patch(f"{BASE}/{task['id']}", json={"done": True}, timeout=5)
print(updated.json())

deleted = requests.delete(f"{BASE}/{task['id']}", timeout=5)
print(deleted.status_code)  # 204: there is no body to parse

missing = requests.get(f"{BASE}/999999", timeout=5)
print(missing.status_code, missing.json()["error"])
