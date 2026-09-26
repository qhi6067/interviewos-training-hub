// src/TaskList.jsx · JavaScript (JSX) with React
import { useEffect, useState } from 'react';

async function api(path = '', options = {}) {
  const response = await fetch(`/api/tasks${path}`, {
    ...options,
    headers: options.body ? { 'Content-Type': 'application/json' } : {},
  });
  if (!response.ok) {
    const problem = await response.json().catch(() => ({}));
    throw new Error(problem.error || `Request failed with ${response.status}`);
  }
  return response.status === 204 ? null : response.json();
}

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api()
      .then(setTasks)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function addTask(event) {
    event.preventDefault();
    try {
      const task = await api('', { method: 'POST', body: JSON.stringify({ title }) });
      setTasks(current => [...current, task]);
      setTitle('');
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggle(task) {
    try {
      const updated = await api(`/${task.id}`, { method: 'PATCH', body: JSON.stringify({ done: !task.done }) });
      setTasks(current => current.map(item => (item.id === task.id ? updated : item)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    try {
      await api(`/${id}`, { method: 'DELETE' });
      setTasks(current => current.filter(item => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p aria-busy="true">Loading tasks…</p>;

  return (
    <section>
      {error && <p className="error-banner" role="alert">{error}</p>}
      <form onSubmit={addTask}>
        <input value={title} onChange={event => setTitle(event.target.value)} placeholder="New task" aria-label="New task" />
        <button disabled={!title.trim()}>Add</button>
      </form>
      <ul>
        {tasks.map(task => (
          <li key={task.id} className="task" data-done={task.done}>
            <label>
              <input type="checkbox" checked={task.done} onChange={() => toggle(task)} /> {task.title}
            </label>
            <button onClick={() => remove(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
