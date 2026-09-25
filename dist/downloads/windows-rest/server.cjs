// InterviewOS Windows REST lesson: local practice, with data kept in memory.
const express = require('express');

function createApp() {
  const app = express();
  let tasks = [{ id: 1, title: 'Practice REST requests', done: false }];
  let nextId = 2;

  // POST and PATCH accept JSON. Headers describe the request body format.
  app.use((req, res, next) => {
    if (['POST', 'PATCH'].includes(req.method) && !req.is('application/json')) {
      return res.status(415).json({ error: 'Send Content-Type: application/json' });
    }
    next();
  });
  app.use(express.json({ limit: '16kb' }));

  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.get('/api/tasks', (req, res) => res.json(tasks));
  app.get('/api/tasks/:id', (req, res) => {
    const task = tasks.find(item => String(item.id) === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  });

  app.post('/api/tasks', (req, res) => {
    const title = req.body?.title;
    if (typeof title !== 'string' || !title.trim() || title.length > 120) {
      return res.status(400).json({ error: 'title must be a nonempty string, up to 120 characters' });
    }
    const task = { id: nextId++, title: title.trim(), done: false };
    tasks.push(task);
    res.location(`/api/tasks/${task.id}`).status(201).json(task);
  });

  app.patch('/api/tasks/:id', (req, res) => {
    const task = tasks.find(item => String(item.id) === req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (typeof req.body?.done !== 'boolean') {
      return res.status(400).json({ error: 'done must be true or false, without quotes' });
    }
    task.done = req.body.done;
    res.json(task);
  });

  app.delete('/api/tasks/:id', (req, res) => {
    const index = tasks.findIndex(item => String(item.id) === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Task not found' });
    tasks.splice(index, 1);
    res.status(204).end();
  });

  app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
  // Express error handlers take four arguments, including next.
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'JSON body is too large' });
    console.error(err.message);
    res.status(500).json({ error: 'Unexpected server error' });
  });
  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error('PORT must be an integer from 1 to 65535.');
    process.exit(1);
  }
  // Loopback keeps this unauthenticated practice API on your own computer.
  const server = createApp().listen(port, '127.0.0.1', error => {
    if (error) return;
    console.log(`REST practice server: http://127.0.0.1:${port}`);
    console.log('Keep this terminal open. Press Ctrl+C to stop. Data resets on restart.');
  });
  server.on('error', err => {
    console.error(err.code === 'EADDRINUSE' ? `Port ${port} is busy. Use another PORT or stop your previous server.` : err.message);
    process.exitCode = 1;
  });
}

module.exports = { createApp };
