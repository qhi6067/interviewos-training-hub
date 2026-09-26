// app/api/tasks/[id]/route.ts · the [id] folder is a dynamic path segment
import { tasks } from '@/lib/tasks';

type Context = { params: Promise<{ id: string }> };
const indexOf = (id: string) => tasks.findIndex(task => task.id === Number(id));
const notFound = () => Response.json({ error: 'Task not found' }, { status: 404 });

export async function GET(_request: Request, { params }: Context) {
  const index = indexOf((await params).id);
  return index === -1 ? notFound() : Response.json(tasks[index]);
}

export async function PATCH(request: Request, { params }: Context) {
  const index = indexOf((await params).id);
  if (index === -1) return notFound();
  const body = await request.json().catch(() => null);
  if (typeof body?.done !== 'boolean') {
    return Response.json({ error: 'done must be true or false' }, { status: 400 });
  }
  tasks[index].done = body.done;
  return Response.json(tasks[index]);
}

export async function DELETE(_request: Request, { params }: Context) {
  const index = indexOf((await params).id);
  if (index === -1) return notFound();
  tasks.splice(index, 1);
  return new Response(null, { status: 204 });
}
