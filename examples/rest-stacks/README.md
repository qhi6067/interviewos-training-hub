# One task API, nine stacks

Every sample here serves or calls the same REST contract as the InterviewOS Windows REST lesson:

| Request | Body | Success | Errors |
| --- | --- | --- | --- |
| `GET /api/tasks` | none | 200 + array | none |
| `GET /api/tasks/:id` | none | 200 + task | 404 |
| `POST /api/tasks` | `{"title": "1-120 characters"}` | 201 + task + `Location` header | 400 (422 in FastAPI) |
| `PATCH /api/tasks/:id` | `{"done": true}` | 200 + task | 400 (422 in FastAPI), 404 |
| `DELETE /api/tasks/:id` | none | 204, empty body | 404 |

Data lives in memory, so every server starts with one task and resets on restart.

## Servers

| Folder | Language | Setup (PowerShell) | URL |
| --- | --- | --- | --- |
| `express` | JavaScript (Node.js + Express 5) | `npm.cmd init -y`, `npm.cmd install express@5`, `npm.cmd pkg set 'scripts.dev=node --watch server.cjs'`, `npm.cmd run dev` | http://127.0.0.1:3001/api/tasks |
| `nextjs` | TypeScript (Next.js App Router) | `npx.cmd create-next-app@latest tasks-next --ts --app --no-src-dir --import-alias "@/*" --use-npm --yes`, copy `lib` and `app/api` into the project, `npm.cmd run dev` | http://localhost:3000/api/tasks |
| `fastapi` | Python (FastAPI + Pydantic) | `py -m pip install fastapi uvicorn`, `py -m uvicorn main:app --reload --port 8000` | http://127.0.0.1:8000/api/tasks (docs at `/docs`) |
| `spring` | Java 21 (Spring Boot 4, Spring Web) | Create a Maven project at start.spring.io with Spring Web and package `com.example.tasks`, add `TaskController.java`, `.\mvnw.cmd spring-boot:run` | http://localhost:8080/api/tasks |

## Clients

| File | Language | Run |
| --- | --- | --- |
| `clients/TaskList.jsx` | JavaScript (JSX, React) | Use inside the React task manager starter (Vite proxy to port 3001). In Next.js, add `'use client';` as the first line. |
| `clients/styles.css` | CSS | Import next to `TaskList.jsx`; it styles the loading, error, disabled, and done states. |
| `clients/client.py` | Python (requests) | `py -m pip install requests`, `py client.py` |
| `clients/client.ps1` | PowerShell | `powershell -ExecutionPolicy Bypass -File .\client.ps1` |
| `clients/curl.sh` | Bash + curl | `bash curl.sh` in Git Bash, macOS, or Linux |

The clients call port 3001. Change the base URL to try another server.

These samples were run against a shared contract check: Express, Next.js 16 (`next dev` and `next start`), FastAPI, and Spring Boot 4.1 on Java 21. The React and CSS files were exercised in Chromium against the Next.js API, and the PowerShell file with PowerShell 7.6. Windows PowerShell 5.1 was not available to test.
