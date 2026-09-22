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

Use `1`–`3` to switch labs and `Alt+1`–`4` to switch practice modes.
