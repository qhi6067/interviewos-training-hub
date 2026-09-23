(function (root) {
  'use strict';
  const n = (id, title, sub, x, y, detail) => ({ id, title, sub, x, y, detail });
  const e = (from, to, label, both = false) => ({ from, to, label, both });
  const lessons = [
    {
      id: 'dns', title: 'DNS: a name becomes an address', category: 'Foundations', time: '6 min',
      intro: 'DNS is the directory lookup before a connection. A resolver returns records for a hostname; the client then contacts the destination. DNS caches improve speed, but their time-to-live (TTL) can delay the effect of a changed record.',
      diagram: 'Name resolution and application traffic are separate paths',
      nodes: [
        n('client', 'Browser / C2 client', 'api.example.test', 30, 40, 'The client checks available local caches and asks its configured DNS resolver for an address when needed.'),
        n('resolver', 'Recursive resolver', 'finds the answer', 320, 40, 'A cache hit can answer immediately. On a miss, the resolver follows DNS delegations, potentially contacting root and TLD servers before the authoritative server.'),
        n('authority', 'Authoritative DNS', 'owns zone records', 610, 40, 'This is the authoritative source for the domain’s records. A/AAAA records give IPv4/IPv6 addresses; aliases may require further resolution.'),
        n('cache', 'DNS cache', 'record + TTL', 320, 240, 'A cached answer is reused until its TTL policy requires a refresh. Changing a record does not erase all previously cached answers instantly.'),
        n('service', 'Destination service', 'HTTPS on port 443', 30, 240, 'After resolution, application traffic goes to the destination address. DNS does not forward the API request. The hostname still matters for TLS certificates and virtual hosting.')
      ],
      edges: [e('client','resolver','query / answer',true),e('resolver','authority','DNS lookup',true),e('resolver','cache','cache lookup',true),e('client','service','HTTPS later',true)],
      takeaways: [['Vocabulary','Hostname is a name; IP is a network address; port selects a transport endpoint. They are different parts of reaching a service.'],['Design choice','Use TTLs and health-aware routing deliberately. Shorter TTLs can speed changes but increase DNS query traffic and do not guarantee instant failover.'],['Debug first','Compare a DNS lookup with the expected record, check the resolver and TTL, then test connectivity. A DNS error happens before your API handler runs.']],
      trap: 'DNS is not a load balancer that proxies every request. DNS can distribute address answers; a proxy load balancer handles actual connections or requests.',
      prompt: 'A service moved to a new IP, but some clients still reach the old server. Explain what you would check.',
      answer: 'I would inspect the authoritative record and what the affected resolver returns, including TTL and cached answers. I would verify the new service and certificate, keep the old endpoint available during the transition, and separate DNS resolution failures from later TCP, TLS, or HTTP failures.',
      question: 'After DNS returns an IP, where does the HTTPS request go?', options: ['Through the DNS server as a proxy','To the destination address','Only to the authoritative DNS server'], correct: 1,
      explanation: 'DNS supplies addressing information. The client establishes a separate connection to the destination.',
      source: ['AWS Route 53: DNS routing','https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/welcome-dns-service.html']
    },
    {
      id: 'ip', title: 'IP, ports, subnets & routing', category: 'Foundations', time: '8 min',
      intro: 'IP moves packets between addresses. A subnet groups an address range; a route table chooses the next hop. Ports identify endpoints on a host. Connectivity needs both a valid route and permission through the relevant firewalls.',
      diagram: 'A private service can initiate an outbound vendor call through NAT',
      nodes: [
        n('app','Private application','10.0.1.10:ephemeral',30,40,'The caller uses its private source IP and a temporary source port. The vendor destination might be port 443. A port number is not itself an authentication rule.'),
        n('route','Subnet route table','choose next hop',320,40,'For an IPv4 destination outside the VPC, a matching route may send traffic to a NAT gateway. Routes decide where packets go; they do not grant application permission.'),
        n('nat','Public NAT gateway','outbound translation',610,40,'NAT maps the private source address and port to a public-facing mapping. Return packets for that flow are translated back. This is not an inbound port-forward for arbitrary internet callers.'),
        n('igw','Internet gateway','VPC internet path',610,240,'A public NAT gateway reaches the internet through an internet gateway. Subnet routes, gateway attachment, and address configuration must agree.'),
        n('vendor','Vendor API','public address:443',320,240,'The vendor sees the translated source. Its allowlist, TLS certificate, and API authentication can still reject a connection that has a valid network path.'),
        n('reply','Return traffic','existing connection',30,240,'Return traffic follows the established NAT mapping and network rules. Packet delivery does not prove the business operation succeeded.')
      ],
      edges: [e('app','route','packet'),e('route','nat','default route'),e('nat','igw','egress'),e('igw','vendor','internet'),e('vendor','reply','via NAT mapping')],
      takeaways: [['CIDR','10.0.1.0/24 describes 256 IPv4 addresses: the first 24 bits are the prefix. Providers may reserve some addresses; do not assume all are usable hosts.'],['Routing vs filtering','A route is a path, a firewall rule is permission, and a listening process is a destination. Check all three when a request times out.'],['Private networking','Private addresses are not globally routed on the public internet. VPNs or private links can connect private networks; overlapping CIDR ranges complicate routing.']],
      trap: '“The port is open” does not prove the API is authorized, healthy, or returning valid data.',
      prompt: 'A private service cannot reach a vendor on port 443. How would you narrow it down?',
      answer: 'I would verify DNS, destination IP and port, subnet routes, outbound firewall rules, NAT and internet paths, and the return path. Then I would check the TLS handshake and HTTP status. If TCP connects but HTTP returns 401, I would investigate credentials rather than changing routes.',
      question: 'What does a route table primarily determine?', options: ['Which user owns the data','Whether JSON is valid','The next hop for a destination address'], correct: 2,
      explanation: 'Routing selects a path. Firewalls and application authorization enforce different rules.',
      source: ['AWS VPC: private subnets and NAT','https://docs.aws.amazon.com/vpc/latest/userguide/vpc-example-private-subnets-nat.html']
    },
    {
      id: 'transport', title: 'TCP, UDP, TLS & HTTP versions', category: 'Foundations', time: '8 min',
      intro: 'TCP presents ordered bytes and retransmits lost data. UDP sends datagrams without those built-in guarantees. TLS encrypts and authenticates a connection. HTTP defines application messages. These layers solve different problems.',
      diagram: 'A common HTTPS stack: HTTP/1.1 or HTTP/2 over TLS and TCP',
      nodes: [
        n('http','HTTP request','method · headers · body',30,40,'The application describes an operation, such as GET /tracks. HTTP status codes describe an application-layer outcome.'),
        n('tls','TLS session','encryption + peer identity',320,40,'The client checks the server certificate and negotiates encrypted transport. TLS does not decide whether the logged-in user may access a particular record.'),
        n('tcp','TCP connection','ordered byte stream',610,40,'TCP establishes a connection, tracks sequence numbers, retransmits loss, and manages flow/congestion. It does not preserve your application message boundaries.'),
        n('ip','IP packets','addressing + routing',610,240,'Routers forward packets toward the destination. Loss, variable delay, and network partitions remain possible.'),
        n('receiver','Receiving stack','IP → TCP → TLS → HTTP',320,240,'The destination reconstructs the stream, decrypts it, and parses an HTTP request. A network acknowledgment is not a database commit.'),
        n('operation','Business operation','validate + persist',30,240,'Only application logic can report whether an operation was accepted or completed. A timeout after sending leaves an uncertain outcome; retry carefully.')
      ],
      edges: [e('http','tls','encode'),e('tls','tcp','encrypted bytes'),e('tcp','ip','segments'),e('ip','receiver','network'),e('receiver','operation','handler')],
      takeaways: [['TCP vs UDP','Use TCP when reliable ordered transport suits the application. UDP can support latency-sensitive protocols, but the application or a protocol above it must provide any needed reliability.'],['HTTP/3 exception','HTTP/3 uses QUIC over UDP, with TLS integrated into QUIC. “All HTTPS uses TCP” is incorrect. HTTP/2 multiplexes streams over TCP; packet loss can delay that shared connection.'],['Timeouts','Distinguish connect timeout, TLS failure, read timeout, and overall request deadline. Retries need a bounded budget and safe operation semantics.']],
      trap: 'Reliable transport does not provide exactly-once business effects. The server may commit a write and lose the response.',
      prompt: 'A payment or command request times out after being sent. Does TCP make retrying it safe?',
      answer: 'No. The server might have completed the action before the response was lost. I would use an operation ID or idempotency key with durable server-side deduplication, check the result where possible, and retry only under a defined deadline and policy.',
      question: 'Which protocol does HTTP/3 use for transport?', options: ['QUIC over UDP','Raw TCP without TLS','DNS'], correct: 0,
      explanation: 'HTTP/3 runs over QUIC, which uses UDP and integrates TLS. Do not generalize the older HTTPS stack to every HTTP version.',
      source: ['MDN: Evolution of HTTP','https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Evolution_of_HTTP']
    },
    {
      id: 'api', title: 'APIs: HTTP, REST, SOAP & gRPC', category: 'Application', time: '8 min',
      intro: 'An API is a contract between systems. REST is an architectural style often implemented with HTTP resources; SOAP is a structured messaging protocol commonly using XML; gRPC is an RPC framework commonly using Protocol Buffers and HTTP/2. Choose based on the client and contract.',
      diagram: 'Follow a write request through independent validation boundaries',
      nodes: [
        n('caller','API client','POST /commands',30,40,'Send a documented method, content type, credentials, request body, and an idempotency key where the contract supports it.'),
        n('edge','API gateway','limits + authentication',320,40,'An API gateway can route, authenticate, validate selected request rules, and throttle. Its exact responsibilities are configuration choices, not automatic guarantees.'),
        n('handler','Service handler','authorize + validate',610,40,'Check whether this user may command this resource, validate the schema and domain rules, and avoid trusting a tenant ID just because the caller supplied it.'),
        n('store','Durable state','operation + result',610,240,'Persist the intended operation and its idempotency identity consistently. A retry should return the known outcome rather than repeating a side effect.'),
        n('response','HTTP response','status + structured body',320,240,'201 can indicate creation; 202 indicates acceptance for later work. 401 concerns missing/invalid authentication, 403 denied access, 429 throttling, and 5xx server failure.'),
        n('recovery','Client decision','display · retry · inspect',30,240,'Honor Retry-After where applicable, use exponential backoff with jitter, and avoid blindly retrying permanent validation errors. Version the contract deliberately.')
      ],
      edges: [e('caller','edge','HTTPS'),e('edge','handler','route'),e('handler','store','commit'),e('store','response','result'),e('response','recovery','interpret')],
      takeaways: [['REST','Resources, representations, HTTP semantics, and stateless requests. JSON alone does not make an API RESTful. GET should not perform requested business mutations.'],['SOAP / gRPC','SOAP may be required by a vendor’s XML/WSDL contract. gRPC can offer typed service methods and streaming; browser support and gateways deserve explicit discussion.'],['CORS / webhooks','CORS is a browser rule, not server authorization. A webhook is a server callback: authenticate it, prevent replay, acknowledge promptly, and process idempotently.']],
      trap: 'A 200 response only means what the API contract says. For asynchronous work, transport acceptance and business completion are separate states.',
      prompt: 'Design a command API that clients can retry after losing the response.',
      answer: 'I would define an operation resource and an idempotency key scoped to the caller. The server authorizes the resource, validates the payload, and atomically records the operation identity and outcome. A repeated key with the same request returns the existing result; conflicting content is rejected. Long work can return 202 and a status URL.',
      question: 'What does HTTP 202 normally communicate?', options: ['The operation is guaranteed complete','The request was accepted for processing','The client must change its DNS server'], correct: 1,
      explanation: '202 signals acceptance, not final completion. The contract should explain how the caller learns the eventual outcome.',
      source: ['MDN: HTTP response status codes','https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status']
    },
    {
      id: 'websocket', title: 'WebSockets, SSE & polling', category: 'Real time', time: '9 min',
      intro: 'Polling repeats requests. Server-Sent Events (SSE) streams events from server to browser over HTTP. WebSocket supports two-way messages on a persistent connection. Start with the required direction, update frequency, and tolerated delay.',
      diagram: 'A live connection and a recovery path serve different needs',
      nodes: [
        n('client','Operator / C2','live view + cursor',30,40,'Use REST for snapshots or commands when suitable. Choose WebSocket for ongoing bidirectional messages. The classic HTTP/1.1 handshake upgrades with a 101 response; newer HTTP versions have other bootstrapping mechanisms.'),
        n('gateway','Connection gateway','TLS · auth · connections',320,40,'The gateway holds live connections, authenticates them, and checks subscriptions. Heartbeats and idle timeouts help detect broken connections but do not restore missed events.'),
        n('bus','Publish / subscribe','distribute live updates',610,40,'Route events to all gateway instances with interested clients. Specify whether the messaging system is durable; basic pub/sub may lose events for offline subscribers.'),
        n('producer','Telemetry service','event ID + sequence',610,240,'Produce events with stable IDs and ordering information for the entity that matters. A global total order may be unnecessary and expensive.'),
        n('history','Durable event log','bounded replay history',320,240,'Keep replayable events where history is required. Define retention and what happens if the client’s cursor is older than the retained log.'),
        n('snapshot','Snapshot / replay API','repair after reconnect',30,240,'Reconnect with backoff and jitter, reauthorize, then replay after the cursor or fetch a fresh snapshot. Clients deduplicate IDs and show data age.')
      ],
      edges: [e('client','gateway','two-way frames',true),e('bus','gateway','fan-out'),e('producer','bus','publish'),e('producer','history','persist'),e('history','snapshot','read history'),e('snapshot','client','recover')],
      takeaways: [['Choose the transport','Polling is simple for occasional updates. SSE suits one-way feeds and offers a browser reconnection mechanism; replay still needs server support. WebSocket suits bidirectional interaction.'],['Flow control','A slow client can build a backlog. Bound buffers, coalesce replaceable state, or disconnect and resync. Preserve commands and audit events according to their durability needs.'],['AWS option','API Gateway WebSocket APIs can hold connections and invoke Lambda for events. Lambda does not need to keep a function running for the connection’s lifetime.']],
      trap: 'WebSocket does not automatically replay missed messages, guarantee exactly-once delivery, or authorize every subscription.',
      prompt: 'An operator reconnects after 30 seconds offline. How do you prevent an apparently live but stale map?',
      answer: 'I would show connection state and data timestamps. The client reconnects with backoff, authenticates, and presents its last cursor. The server replays retained events or returns a fresh snapshot if the cursor is too old. Sequence checks and event IDs handle gaps and duplicates, with bounded client buffers.',
      question: 'Who owns the persistent connection in an API Gateway WebSocket + Lambda design?', options: ['A Lambda invocation running forever','The DNS resolver','API Gateway; Lambda handles discrete events'], correct: 2,
      explanation: 'API Gateway manages the connection. Lambda can handle connect, message, and disconnect events and use the callback API to send messages.',
      source: ['AWS: API Gateway WebSocket APIs','https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-overview.html']
    },
    {
      id: 'balancing', title: 'Load balancers, proxies & scaling', category: 'Reliability', time: '8 min',
      intro: 'A load balancer distributes work across targets. Layer 4 routing uses transport-level information; Layer 7 routing can inspect HTTP hostnames and paths. Scaling adds capacity, while health checks decide which targets are eligible to receive traffic.',
      diagram: 'Distribute requests across healthy instances in separate failure zones',
      nodes: [
        n('clients','Clients','HTTPS / WebSocket',30,40,'Many clients reach one service endpoint. They should not need to know individual application instance addresses.'),
        n('lb','Load balancer','L4 or L7 policy',320,40,'An AWS Application Load Balancer is an L7 choice for HTTP/HTTPS and supports WebSocket upgrades. Network Load Balancer handles transport-level traffic. Capabilities differ; choose explicitly.'),
        n('a','App instance A','availability zone A',610,40,'Keep request handling stateless when practical. A WebSocket remains tied to its selected connection target while it is open.'),
        n('b','App instance B','availability zone B',320,240,'Health checks can remove an unhealthy instance from new routing. Autoscaling is a separate control loop; it takes time and cannot fix an overloaded shared database by itself.'),
        n('state','Shared state / data','session or durable data',610,240,'Shared state lets another instance serve a later request. For real-time fan-out, use a suitable shared messaging layer; a load balancer does not broadcast events.'),
        n('drain','Deployment policy','drain → replace → resume',30,240,'Stop admitting new work, drain in-flight requests where possible, and allow clients to reconnect. Define what readiness means, not just whether the process exists.')
      ],
      edges: [e('clients','lb','connect'),e('lb','a','healthy target'),e('lb','b','healthy target'),e('a','state','read / write',true),e('b','state','read / write',true),e('drain','b','lifecycle')],
      takeaways: [['L4 vs L7','A TCP-oriented design may need L4 balancing. Host/path routing and HTTP-aware policies suggest L7. TLS termination and re-encryption are explicit trust-boundary choices.'],['Affinity','Sticky sessions can preserve locality but complicate failover and balance. They do not replace shared durable state or a reconnect strategy.'],['Health vs scale','Separate liveness, readiness, connection draining, and scaling signals. CPU alone may miss connection limits, queue lag, or a saturated dependency.']],
      trap: 'Adding more app instances will not necessarily reduce latency if the database, vendor quota, or queue consumer is the bottleneck.',
      prompt: 'How would you deploy a new WebSocket server version without losing the fleet dashboard?',
      answer: 'I would roll instances gradually, check readiness, stop new connections to retiring targets, and use a defined drain period. Clients reconnect with jitter and resume by cursor or snapshot. Shared event distribution reaches all active gateways, and I monitor reconnect rate, active connections, latency, and stale displays.',
      question: 'What does a load balancer NOT automatically provide?', options: ['Application-level replay of missed WebSocket events','Routing to configured targets','Distribution of incoming connections'], correct: 0,
      explanation: 'Replay requires application state and a recovery protocol. Routing traffic alone does not reconstruct missing events.',
      source: ['AWS: Application Load Balancer listeners','https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-listeners.html']
    },
    {
      id: 'vpc', title: 'AWS VPCs, security groups & IAM', category: 'Cloud', time: '9 min',
      intro: 'A VPC is a logically isolated network. Subnets and route tables shape reachability; security groups filter traffic at attached resources. IAM controls AWS identities and actions. Network access and identity permission must both be designed.',
      diagram: 'Expose the entry point while keeping application and database tiers private',
      nodes: [
        n('internet','Internet client','untrusted entry',30,40,'The public client reaches an approved endpoint. An internet gateway and appropriate subnet/address configuration enable the network path; a route alone does not grant access.'),
        n('alb','Public entry point','ALB in public subnets',320,40,'Terminate external HTTPS at the load balancer where appropriate. Public subnets have a route to an internet gateway. Use multiple availability zones for resilience.'),
        n('app','Private application','app security group',610,40,'Permit the application port from the load balancer’s security group instead of the entire internet. A private subnet does not need direct public inbound routing.'),
        n('db','Private database','database security group',610,240,'Permit the database port only from the application tier that needs it. Credentials and database permissions still apply after network access succeeds.'),
        n('iam','IAM role','least-privilege actions',320,240,'Give the app narrowly scoped permissions for required AWS actions and resources. IAM is not a replacement for network routing or security-group rules.'),
        n('nacl','Subnet ACL','optional subnet filtering',30,240,'Security groups are stateful; network ACLs are stateless subnet rules. With ACLs, account for both directions, including response ports. Keep rules auditable and avoid unnecessary layers.')
      ],
      edges: [e('internet','alb','HTTPS :443'),e('alb','app','app port'),e('app','db','DB port'),e('iam','app','permissions')],
      takeaways: [['Security groups','Think “which source may reach which port?” Use tier-to-tier rules and least privilege. Stateful return traffic differs from stateless ACL behavior.'],['Egress','A private app may use NAT for internet egress or VPC endpoints for supported AWS services. NAT does not automatically make it publicly reachable from outside.'],['Resilience','An availability zone is a separate fault domain within a region. Multi-AZ architecture, backups, and tested recovery solve different failure cases.']],
      trap: 'A private subnet is not a complete security policy. Bad credentials, excessive IAM permissions, or permissive internal access can still expose data.',
      prompt: 'Why can the app call S3 but not the database—or reach the database port and still be denied?',
      answer: 'I would inspect the network and identity layers separately: routes, endpoints, security groups, ACLs, then IAM or database credentials and permissions. A successful TCP connection proves reachability to a listener, not authorization to read a table. I would scope each tier’s network and identity permissions to its actual needs.',
      question: 'Which statement is correct?', options: ['IAM creates routes between subnets','A public subnet makes every resource automatically accessible','Security groups are stateful; network ACLs are stateless'], correct: 2,
      explanation: 'These controls operate differently. Routes, filtering, public addressing, and identity permissions all matter.',
      source: ['AWS VPC: security groups and network ACLs','https://docs.aws.amazon.com/vpc/latest/userguide/infrastructure-security.html']
    },
    {
      id: 'lambda', title: 'AWS Lambda & asynchronous APIs', category: 'Cloud', time: '9 min',
      intro: 'Lambda runs functions in response to events. It can fit bursty, bounded work, but duration limits, concurrency, startup latency, and downstream capacity still matter. A managed queue separates accepting work from finishing it.',
      diagram: 'Accept a job, then process it with an idempotent worker',
      nodes: [
        n('gateway','API Gateway','HTTPS + API contract',30,40,'The API entry point routes authenticated requests. Return a job ID and 202 only after your chosen durable acceptance boundary succeeds.'),
        n('ingest','Ingest Lambda','validate + enqueue',320,40,'Authorize the request, validate its schema, and enqueue work. Keep the synchronous response quick; provide a status resource for eventual completion.'),
        n('queue','SQS queue','buffer accepted jobs',610,40,'The queue holds messages while consumers catch up. Configure visibility timeout, retention, and a dead-letter policy. The queue does not execute business code or directly write your result table.'),
        n('worker','Worker Lambda','SQS event source mapping',610,240,'Lambda polls SQS through its event source mapping and invokes the worker with batches. Processing must tolerate redelivery. Use partial batch responses where appropriate to avoid retrying successful records.'),
        n('db','DynamoDB / database','job state + result',320,240,'The worker uses durable operation IDs and conditional or transactional writes as needed. Queue-level deduplication alone cannot make every downstream side effect exactly once.'),
        n('dlq','Dead-letter queue','inspect + replay',30,240,'After the configured receive limit, repeatedly failing messages can go to a dead-letter queue. Alert on it, fix the cause, then replay safely. Do not silently drop it.')
      ],
      edges: [e('gateway','ingest','invoke'),e('ingest','queue','send message'),e('queue','worker','poll / invoke'),e('worker','db','idempotent write'),{...e('queue','dlq','redrive policy'),path:'M790 80 H805 V380 H120 V320',labelX:410,labelY:373}],
      takeaways: [['Choose compute','Use Lambda for bounded event handlers where its cost and limits fit. Containers on ECS/Fargate or EC2 offer different lifecycle and runtime control. Measure before choosing.'],['Concurrency','More invocations can overwhelm a database or vendor. Bound concurrency and connection use, budget retries, and measure queue age as well as error rate.'],['Managed services','SQS is a work queue; SNS or EventBridge route/fan out events in different ways. RDS provides relational storage, DynamoDB key-oriented access patterns, S3 object storage, and CloudWatch operational signals.']],
      trap: '“Serverless” removes some server administration, not capacity planning, security, observability, or retry design.',
      prompt: 'Your Lambda worker times out after writing its result. SQS delivers the job again. What protects the system?',
      answer: 'I would store the operation identity durably and make the effect idempotent with an appropriate atomic write or downstream idempotency contract. The worker can recognize a completed operation and return its existing result. I would align visibility and execution timeouts, bound retries, and monitor the DLQ and oldest message age.',
      question: 'Which component performs the business work in this queued design?', options: ['SQS automatically writes the database result','The worker Lambda consuming messages','DNS executes the job'], correct: 1,
      explanation: 'The queue buffers and delivers work. A consumer executes the operation and writes the result.',
      source: ['AWS Lambda: using Amazon SQS','https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html']
    },
    {
      id: 'reliability', title: 'Queues, caches & delivery guarantees', category: 'Reliability', time: '9 min',
      intro: 'A queue buffers work, pub/sub distributes events to subscribers, and a cache accelerates repeated reads. Each adds a correctness question: what can be repeated, missed, delayed, or stale? Choose based on the data’s meaning.',
      diagram: 'A worker commits durable state before acknowledging completion',
      nodes: [
        n('producer','Producer','stable operation ID',30,40,'Give a business event a stable identity. If writing to a database and publishing an event must agree, consider a transactional outbox instead of two unrelated writes.'),
        n('queue','Durable queue','at-least-once example',320,40,'Delivery can be repeated after a failure or visibility timeout. Use per-key ordering only where required, and do not promise a global order casually.'),
        n('worker','Consumer','validate + deduplicate',610,40,'Deduplication needs the correct scope, a durable record, and an atomic relationship to the effect. An in-memory set is lost when the process restarts.'),
        n('db','Source of truth','transaction / condition',610,240,'Commit the business change safely. A worker crash after commit but before acknowledgment is the classic redelivery case.'),
        n('ack','Acknowledge / delete','after successful processing',320,240,'Acknowledge only after the required durable effect succeeds. A lost acknowledgment can cause another delivery, which the consumer must handle.'),
        n('cache','Cache / read model','TTL + invalidation',30,240,'Keep an explicit staleness policy. Write-through, invalidation, or asynchronous updates have different failure modes. A cache is not automatically your source of truth.')
      ],
      edges: [e('producer','queue','publish'),e('queue','worker','deliver'),e('worker','db','commit'),e('db','ack','success'),{...e('db','cache','refresh / invalidate'),path:'M700 320 V370 H120 V320',labelX:410,labelY:363}],
      takeaways: [['Retry policy','Retry transient failures with backoff, jitter, attempt limits, and a deadline. Use a circuit breaker to reduce calls to a failing dependency, with a controlled recovery probe.'],['Backpressure','Bound queues and monitor oldest-message age. Drop or coalesce replaceable telemetry only when allowed; preserve critical commands and audit events.'],['Consistency','A replica or cache can lag. Clarify read-after-write needs, ordering per entity, and what the UI displays when data is stale or unavailable.']],
      trap: 'At-least-once delivery means possible duplicates. Exactly-once claims require a stated boundary; a queue setting cannot guarantee every external side effect happens only once.',
      prompt: 'A webhook appears twice and the customer receives two emails. Where would you fix it?',
      answer: 'I would deduplicate using the event’s business identity and tenant scope, persist the processing outcome, and make the email send safe through an idempotent downstream contract or a durable sending workflow. I would trace whether duplication originated at the producer, queue redelivery, or a retry after an uncertain result.',
      question: 'A consumer commits a write, then crashes before acknowledging the message. What should you expect?', options: ['Possible redelivery requiring idempotent processing','The message can never return','The database automatically undoes every write'], correct: 0,
      explanation: 'The queue may not know that processing succeeded. Durable idempotency lets a retry avoid repeating the business effect.',
      source: ['AWS SQS: at-least-once delivery','https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html']
    },
    {
      id: 'debugging', title: 'Troubleshoot a slow or broken request', category: 'Interview drill', time: '10 min',
      intro: 'Debug from the outside in. Establish the failing layer before proposing a fix. Compare affected and healthy requests using timestamps and correlation IDs, then follow latency, errors, and saturation across dependencies.',
      diagram: 'A diagnostic sequence, not a packet forwarding topology',
      nodes: [
        n('dns','DNS','does the name resolve?',30,40,'Inspect the returned records, resolver, TTL, and split-horizon expectations. A failed lookup is different from a timeout connecting to a valid IP.'),
        n('tcp','Network / TCP','can a connection form?',320,40,'Check route, port, listener, firewall, and connection timeout. A ping result alone is not conclusive: ICMP and TCP may have different policies.'),
        n('tls','TLS','is the peer trusted?',610,40,'Check hostname, certificate chain and validity, client trust, and handshake errors. Avoid solving this by disabling certificate verification.'),
        n('http','HTTP / gateway','which status and duration?',610,240,'A 401, 403, 429, 502, or 504 points to different checks. Inspect gateway logs and timeouts; a 5xx may originate at a proxy rather than the application.'),
        n('service','App / dependencies','where is time spent?',320,240,'Use traces and structured logs to compare queue wait, handler work, database queries, and vendor calls. Check connection pools, throttling, and retries multiplying load.'),
        n('slo','User impact','freshness + latency + errors',30,240,'Define a service-level objective (SLO) in terms users notice. Percentile latency reveals slow requests hidden by an average. Track queue age, reconnects, and stale telemetry too.')
      ],
      edges: [e('dns','tcp','if resolved'),e('tcp','tls','if connected'),e('tls','http','if secure'),e('http','service','trace request'),e('service','slo','measure impact')],
      takeaways: [['Signals','Logs describe events, metrics summarize measurements, and traces connect spans across a request. Carry correlation IDs and avoid logging secrets or sensitive payloads.'],['Failure budget','Assign an overall deadline and smaller dependency timeouts. Retrying at every layer can multiply traffic and make an outage worse.'],['Interview structure','State the symptom and scope, form a hypothesis, name the evidence that would confirm it, then propose a bounded fix and verification step.']],
      trap: 'An average response time of 100 ms does not mean every request meets a 200 ms target. Inspect percentiles and the population they represent.',
      prompt: 'The dashboard is stale, HTTP returns 200, and CPU looks normal. What do you check next?',
      answer: 'I would measure end-to-end data age, verify event timestamps and clock assumptions, inspect queue age and consumer lag, and trace an event into the live gateway. I would check dropped subscriptions, cache age, slow-client buffers, and reconnect recovery. Transport success and low CPU do not prove fresh application data.',
      question: 'Which metric most directly detects a stale telemetry display?', options: ['The number of DNS records','Application source-file count','Age of the latest displayed event'], correct: 2,
      explanation: 'Freshness is an end-to-end property. HTTP success, CPU, and connection health are supporting signals, not substitutes for data age.',
      source: ['OpenTelemetry: observability signals','https://opentelemetry.io/docs/concepts/signals/']
    }
  ];
  if (typeof module === 'object' && module.exports) module.exports = lessons;
  else root.SystemForgeLessons = lessons;
})(typeof window === 'object' ? window : globalThis);
