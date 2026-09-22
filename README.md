# InterviewOS Training Hub

InterviewOS puts the three interview practice labs behind one local tabbed workspace:

- **Flightlab** — drone integrations, C2, WebSockets, telemetry, and REST/SOAP decisions
- **RESTcraft** — API requests, auth, payloads, retries, webhooks, and debugging
- **SystemForge** — system design drills, tradeoffs, scaling, reliability, and interview answers

## Start the workspace

Double-click **Start Interview Hub.cmd**. It checks the three lab servers, starts anything that is missing, and opens `http://127.0.0.1:4330/`.

Use **Stop Interview Hub.cmd** when you are finished. The hub remembers the last selected lab in this browser.

The tabs use the local labs while running on `127.0.0.1`, so each simulator remains interactive inside the hub. The published version points its panels at the three private hosted labs; if a hosted panel asks for sign-in, use its **Open separately** link.
