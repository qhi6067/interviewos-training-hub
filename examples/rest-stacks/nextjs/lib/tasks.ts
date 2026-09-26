// lib/tasks.ts · TypeScript: shared in-memory data for both route files
export type Task = { id: number; title: string; done: boolean };

export const tasks: Task[] = [{ id: 1, title: 'Practice REST requests', done: false }];
let nextId = 2;
export const newId = () => nextId++;
