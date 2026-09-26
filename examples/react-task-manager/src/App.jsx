import React, { useEffect, useState } from 'react';
import { normalizeTitle, visibleTasks, loadTasks } from './helpers.js';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function refresh() {
    setBusy(true); setError('');
    try {
      const result = await loadTasks('/api/tasks');
      if (result.error || !Array.isArray(result.tasks)) throw new Error(result.error || 'Unexpected task response. Check loadTasks.');
      setTasks(result.tasks);
    } catch (err) { setError(err.message || 'Could not load tasks. Is your REST server running?'); }
    finally { setBusy(false); }
  }
  useEffect(() => { refresh(); }, []);

  async function change(path, method, body) {
    setBusy(true); setError('');
    try {
      const response = await fetch(path, {
        method,
        ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      });
      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details.error || `Request failed (${response.status})`);
      }
      if (method === 'POST') setTitle('');
      await refresh();
    } catch (err) { setError(err.message || 'Request failed. Check your REST server and retry.'); }
    finally { setBusy(false); }
  }
  function add(event) {
    event.preventDefault();
    const value = normalizeTitle(title);
    if (!value) { setError('Enter a title of 1–120 characters.'); return; }
    change('/api/tasks', 'POST', { title: value });
  }
  const shown = visibleTasks(tasks, filter);
  return <main>
    <p className="eyebrow">INTERVIEWOS · GUIDED REACT PROJECT</p>
    <h1>My REST task manager</h1>
    <p>React state → HTTP request → Express API → updated screen.</p>
    <aside>Three milestones: edit <code>src/helpers.js</code> to validate titles, filter tasks, and handle API failures. Test each helper in the Coding Workshop first.</aside>
    <form onSubmit={add}>
      <label htmlFor="title">New task</label>
      <div className="row"><input id="title" value={title} onChange={event => setTitle(event.target.value)} placeholder="Practice an interview question" disabled={busy} /><button disabled={busy}>Add task</button></div>
    </form>
    <div className="row toolbar"><label htmlFor="filter">Show</label><select id="filter" value={filter} onChange={event => setFilter(event.target.value)}><option value="all">All</option><option value="open">Open</option><option value="done">Done</option></select><button type="button" onClick={refresh} disabled={busy}>Refresh</button></div>
    {busy && <p role="status">Loading…</p>}
    {error && <p role="alert" className="error">{error} Check the server terminal, then try Refresh.</p>}
    <ul>{shown.map(task => <li key={task.id}><label><input type="checkbox" checked={task.done} disabled={busy} onChange={() => change(`/api/tasks/${task.id}`, 'PATCH', { done: !task.done })} /><span className={task.done ? 'done' : ''}>{task.title}</span></label><button type="button" disabled={busy} onClick={() => change(`/api/tasks/${task.id}`, 'DELETE')}>Delete<span className="sr-only"> {task.title}</span></button></li>)}</ul>
    {!busy && !shown.length && <p>No tasks in this view. Add one or change the filter.</p>}
    <footer>Data is stored in the running API's memory. Restarting that server resets the list.</footer>
  </main>;
}
