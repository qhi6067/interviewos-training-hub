// These deliberately incomplete helpers match the Coding Workshop starters.
// Complete one milestone at a time. Keep "export" when pasting a passing solution.

// Milestone 1: trim/collapse spaces; reject blank, non-string, or >120 characters.
export function normalizeTitle(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// Milestone 2: respect "all", "open", and "done" without changing the input array.
export function visibleTasks(tasks, filter) {
  return tasks;
}

// Milestone 3: handle HTTP/network failures and unexpected JSON shapes.
export async function loadTasks(url) {
  const response = await fetch(url);
  return { tasks: await response.json(), error: '' };
}
