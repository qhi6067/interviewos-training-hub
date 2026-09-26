// server.cjs · JavaScript (CommonJS) on Node.js with Express 5
const express = require('express');
const app = express();
app.use(express.json()); // parse JSON request bodies into req.body

let tasks = [{ id: 1, title: 'Practice REST requests', done: false }];
let nextId = 2;
const findTask = id => tasks.find(task => task.id === Number(id));

app.get('/api/tasks', (req, res) => res.json(tasks));

app.get('/api/tasks/:id', (req, res) => {
  const task = findTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

app.post('/api/tasks', (req, res) => {
  const title = req.body?.title;
  if (typeof title !== 'string' || !title.trim() || title.length > 120) {
    return res.status(400).json({ error: 'title must be 1-120 characters' });
  }
  const task = { id: nextId++, title: title.trim(), done: false };
  tasks.push(task);
  res.status(201).location(`/api/tasks/${task.id}`).json(task);
});

app.patch('/api/tasks/:id', (req, res) => {
  const task = findTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (typeof req.body?.done !== 'boolean') {
    return res.status(400).json({ error: 'done must be true or false' });
  }
  task.done = req.body.done;
  res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  const task = findTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  tasks = tasks.filter(item => item !== task);
  res.status(204).end();
});

app.listen(Number(process.env.PORT) || 3001, '127.0.0.1', () => console.log('Express API ready'));
