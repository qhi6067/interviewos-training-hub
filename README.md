# InterviewOS Training Hub

InterviewOS puts the three interview practice labs behind one local tabbed workspace:

- **Flightlab** — drone integrations, C2, WebSockets, telemetry, and REST/SOAP decisions
- **RESTcraft** — API requests, auth, payloads, retries, webhooks, and debugging
- **SystemForge** — system design drills, tradeoffs, scaling, reliability, and interview answers

## Start the workspace

Double-click **Start Interview Hub.cmd**. It checks the three lab servers, starts anything that is missing, and opens `http://127.0.0.1:4330/`.

Use **Stop Interview Hub.cmd** when you are finished. The hub remembers the last selected lab in this browser.

The tabs use the local labs while running on `127.0.0.1`, so each simulator remains interactive inside the hub. The published version points its panels at the three private hosted labs; if a hosted panel asks for sign-in, use its **Open separately** link.

## Practice modes

- **Progress** — browser-saved mission checkboxes, practice time, recommended next lesson, weak topics, and live localhost health checks
- **Capstone** — trace telemetry through a WebSocket/C2 service, REST adapter, webhook, and system-design decision
- **Interview room** — timed prompts, text or browser speech input, follow-up questions, and a four-part scoring rubric
- **Failure injection** — expired tokens, dropped WebSockets, duplicate messages, rate limits, queue delays, and downstream outages
- **Coding & AI** — 30 guided exercises across JavaScript, TypeScript, Python, React, Next.js App Router, and AI integrations. Each has an explanation, code or architecture prompt, auto-graded knowledge check, hint, worked answer, follow-up question, and self-review criteria. The Progress tab recommends missed questions first.

Use `1`–`3` to switch labs and `Alt+1`–`5` to switch practice modes. Arrow keys navigate the main tab bar. Link directly to coding practice with `/#coding`.

Coding drafts and progress use the separate `interviewos-coding-v1` localStorage key. Existing lab progress is preserved. Storage is specific to a browser and website origin: localhost and the published site do not sync. Written answers are self-reviewed; the scratchpad does not execute code or use an AI grader. No API key is required. “Reset lab progress” leaves coding practice intact.

## Validate coding practice

Run `node --test tests/coding.test.cjs` for grading, persistence, recommendation, and content checks. The hub is a buildless static app: serve `dist` to preview or deploy. Coding content, state rules, UI, and styles are in `dist/coding-data.js`, `dist/coding-core.js`, `dist/coding.js`, and `dist/coding.css` respectively.
