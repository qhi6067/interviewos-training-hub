// app/api/tasks/route.ts · TypeScript route handler (Next.js App Router)
import { tasks, newId } from '@/lib/tasks';

export async function GET() {
  return Response.json(tasks);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const title = body?.title;
  if (typeof title !== 'string' || !title.trim() || title.length > 120) {
    return Response.json({ error: 'title must be 1-120 characters' }, { status: 400 });
  }
  const task = { id: newId(), title: title.trim(), done: false };
  tasks.push(task);
  return Response.json(task, { status: 201, headers: { Location: `/api/tasks/${task.id}` } });
}
