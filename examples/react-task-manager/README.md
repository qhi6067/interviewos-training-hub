# Your React + REST task manager

Beginner project for InterviewOS. This starter works for basic tasks, but three helper functions deliberately miss edge cases. Your job is to finish them using Coding Workshop → Guided projects.

## Start on Windows

1. Install Node.js 24 LTS. Finish the InterviewOS Windows REST lesson and keep its Express server running at `http://127.0.0.1:3001` in terminal A.
2. Extract this ZIP. Open the folder containing `package.json` in File Explorer. Type `powershell` in the address bar and press Enter to open terminal B there.
3. Run `npm.cmd install`, then `npm.cmd run dev`.
4. Open `http://127.0.0.1:5173`. Keep both terminals open. Ctrl+C stops each server.

The browser calls `/api/tasks` on Vite at port 5173. Vite forwards it to Express at port 3001 using the development proxy in `vite.config.js`. This avoids browser cross-origin requests during local development. If you changed the API port, change the proxy to match. Never stop an unrelated service to free a port; use another port instead.

## Complete three milestones

Edit `src/helpers.js`. Each function has a matching browser exercise. Copy a passing function back here and keep `export` before it.

1. `normalizeTitle(value)`: return a trimmed title with whitespace collapsed to single spaces. Reject nonstrings, empty titles, and normalized titles over 120 characters by returning an empty string. Confirm the UI rejects these before sending a POST.
2. `visibleTasks(tasks, filter)`: all keeps every task, open keeps `done === false`, and done keeps `done === true`. Preserve the original array and order. Toggle a task and compare each view.
3. `loadTasks(url)`: await both fetch and JSON, check response.ok and Array.isArray, and catch network/parse errors. Return `{ tasks: [], error: 'Could not load tasks' }` on failure. Stop the API and click Refresh, then restart and retry.

Browser tests use fixtures; this app makes real HTTP requests. Passing fixture tests is one check, not a substitute for running the full application.

## Explore the code

- `src/App.jsx`: useState holds UI data. useEffect loads tasks initially. The form calls POST, checkboxes call PATCH, Delete calls DELETE, and Refresh calls GET.
- `src/helpers.js`: pure filtering/validation plus the async loader you complete.
- `src/main.jsx`: mounts React in the page.
- `vite.config.js`: local development server and proxy.

Try DevTools → Network → a slow connection preset. Confirm Loading appears and write buttons are disabled while a request is in progress. Inspect status codes and JSON bodies. Reload the page to load the API state again. Restarting the API resets its in-memory data.

Explain out loud: Why do we validate in the browser AND server? Why must React state be updated without mutation? Why does fetch need an explicit response.ok check? Why is a 204 DELETE response not parsed as JSON?

## Troubleshooting

- Connection refused / 500 on `/api/tasks`: check terminal A and the proxy port.
- Port 5173 busy: run `npm.cmd run dev -- --port 5174` and open that address.
- PowerShell blocks npm.ps1: use `npm.cmd` as shown above.
- Unsupported Node version: install Node.js 24 LTS and reopen the terminal.

`npm.cmd run build` checks the React production build. Its output still needs a real hosted API and routing setup for deployment; the development proxy is not included in a static production build. No authentication or database is included in this local practice project.
