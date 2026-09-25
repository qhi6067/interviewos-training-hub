# InterviewOS Training Hub

InterviewOS puts the three interview practice labs behind one local tabbed workspace:

- **Flightlab** — drone integrations, C2, WebSockets, telemetry, and REST/SOAP decisions
- **RESTcraft** — API requests, auth, payloads, retries, webhooks, and debugging
- **SystemForge** — system design drills, tradeoffs, scaling, reliability, and interview answers

## Start the workspace

Double-click **Start Interview Hub.cmd**. It checks the three lab servers, starts anything that is missing, and opens `http://127.0.0.1:4330/`.

Use **Stop Interview Hub.cmd** when you are finished. The hub remembers the last selected lab in this browser.

SystemForge is bundled at `/systemforge/` and opens inside the hub on localhost and Vercel. Its Network essentials page is the default when selecting the lab. Flightlab and RESTcraft use their local servers on localhost and their private published links on Vercel; use **Open separately** for those private pages.

## Network & cloud lessons

SystemForge includes 10 lessons: DNS, IP/ports/routing, TCP/UDP/TLS/HTTP versions, REST/SOAP/gRPC APIs, WebSockets/SSE/polling, load balancing, AWS VPC/security/IAM, Lambda and queued work, delivery guarantees/caches, and troubleshooting/observability. Each has an accessible SVG diagram with selectable components, explanations, an interview prompt, sample answer, browser-saved notes, a knowledge check, and a primary reference.

The standalone source is in the sibling `systemforge/dist` project. After editing it, run `node scripts/sync-systemforge.mjs` to copy its six public assets into this repository. The committed bundle deploys without needing that sibling checkout. Nested assets use relative URLs, and no Sites manifest or private files are copied. SystemForge notes use `systemforge-network-v1`; existing lab and coding progress keys remain separate. Previous progress from a different website origin does not automatically transfer.

## Practice modes

- **Progress** — browser-saved mission checkboxes, practice time, recommended next lesson, weak topics, and live localhost health checks
- **Capstone** — trace telemetry through a WebSocket/C2 service, REST adapter, webhook, and system-design decision
- **Interview room** — timed prompts, text or browser speech input, follow-up questions, and a four-part scoring rubric
- **Failure injection** — expired tokens, dropped WebSockets, duplicate messages, rate limits, queue delays, and downstream outages
- **Coding & AI** — 30 guided exercises across JavaScript, TypeScript, Python, React, Next.js App Router, and AI integrations. Each has an explanation, code or architecture prompt, auto-graded knowledge check, hint, worked answer, follow-up question, and self-review criteria. The Progress tab recommends missed questions first.
- **Windows REST** — seven beginner steps for installing Node.js LTS, setting up Express 5, saving and running a downloadable server, testing CRUD with PowerShell, troubleshooting Windows errors, and explaining the design in an interview. Available at `/#windows-rest` and from the lab deck.

Use `1`–`3` to switch labs and `Alt+1`–`6` to switch practice modes. Arrow keys navigate the main tab bar. Link directly to coding practice with `/#coding`.

Coding drafts and progress use the separate `interviewos-coding-v1` localStorage key. Existing lab progress is preserved. Storage is specific to a browser and website origin: localhost and the published site do not sync. Written answers are self-reviewed; the scratchpad does not execute code or use an AI grader. No API key is required. “Reset lab progress” leaves coding practice intact.

## Validate coding practice

Run `node --test tests/coding.test.cjs` for grading, persistence, recommendation, and content checks. The hub is a buildless static app: serve `dist` to preview or deploy. Coding content, state rules, UI, and styles are in `dist/coding-data.js`, `dist/coding-core.js`, `dist/coding.js`, and `dist/coding.css` respectively.

## Validate the Windows REST lesson

The guide is in `dist/windows-rest.js` and `dist/windows-rest.css`. The code preview loads the exact downloadable `dist/downloads/windows-rest/server.cjs` file. The example listens on loopback, stores tasks in memory, and is a local training exercise. It is not run by the Vercel hub.

Install the test dependency into an ignored folder and run real HTTP tests against an ephemeral loopback port from PowerShell:

```powershell
npm.cmd install --prefix .vercel/windows-rest-test express@5 --no-audit --no-fund
$env:NODE_PATH = (Resolve-Path .vercel/windows-rest-test/node_modules).Path
node --test tests/windows-rest.test.cjs
Remove-Item Env:NODE_PATH
```

The test covers CRUD, response status/body/Location, input validation, missing routes, malformed JSON, wrong media types, and oversized bodies. The guide uses `npm.cmd` to avoid PowerShell launcher-policy issues and `curl.exe` to avoid the Windows PowerShell curl alias.
