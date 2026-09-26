# main.py · Python 3 with FastAPI and Pydantic
from fastapi import FastAPI, HTTPException, Response
from pydantic import BaseModel, Field, StrictBool

app = FastAPI()

class NewTask(BaseModel):
    title: str = Field(min_length=1, max_length=120)

class TaskPatch(BaseModel):
    done: StrictBool  # rejects "true" as a string

tasks = [{"id": 1, "title": "Practice REST requests", "done": False}]
next_id = 2

def find_task(task_id: int) -> dict:
    for task in tasks:
        if task["id"] == task_id:
            return task
    raise HTTPException(status_code=404, detail="Task not found")

@app.get("/api/tasks")
def list_tasks():
    return tasks

@app.get("/api/tasks/{task_id}")
def get_task(task_id: int):
    return find_task(task_id)

@app.post("/api/tasks", status_code=201)
def create_task(body: NewTask, response: Response):
    global next_id
    title = body.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="title must be 1-120 characters")
    task = {"id": next_id, "title": title, "done": False}
    next_id += 1
    tasks.append(task)
    response.headers["Location"] = f"/api/tasks/{task['id']}"
    return task

@app.patch("/api/tasks/{task_id}")
def update_task(task_id: int, body: TaskPatch):
    task = find_task(task_id)
    task["done"] = body.done
    return task

@app.delete("/api/tasks/{task_id}", status_code=204)
def delete_task(task_id: int):
    tasks.remove(find_task(task_id))
