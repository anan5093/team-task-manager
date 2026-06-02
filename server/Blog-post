# Building Version 2: Adding an Autonomous AI Swarm to a MERN Stack App

*How I connected a Python microservice to my Node.js backend, wired up a LangGraph state machine, and taught my task manager to think for itself.*

---


> You don't realize your app is dumb until you try to make it smart.

That thought hit me about three months into running version one of my Team Task Manager — a fairly standard MERN stack project. React frontend, Express API, MongoDB. Users could sign up, create projects, drag tasks across a Kanban board. It worked. It did the job.

But every single decision still lived in a human head.

Who should this task go to? Is this project behind schedule? Are we overloading someone? Those questions had answers buried inside the data my app already collected. I just never asked it to surface them.

So I decided to build version two. Not a rewrite — an *expansion*. I would keep every line of my MERN stack intact and bolt on a second brain: a Python-based AI microservice that could read my project data, reason about it, and hand back actual recommendations. An autonomous swarm of specialized agents, orchestrated by a state machine, secured by policy, and running on its own server.

This is the story of how I built that integration, the architecture decisions I made, the 2 AM debugging sessions that nearly broke me, and what I would change if I did it again.

---

## The Problem That Started Everything

Let me paint the picture. My Team Task Manager had real users. Real projects. Real tasks with real deadlines. And every dashboard in the app looked roughly the same: a bunch of numbers. Total tasks: 12. Completed: 4. Overdue: 3.

Those numbers don't *tell* you anything. They don't say "Hey, Rahul has eight open tasks and two of them were due last week, maybe reassign the new frontend ticket to Priya who only has two items on her plate." That kind of insight requires understanding context, comparing workloads, spotting patterns across time.

I wanted my dashboard to say something useful when you opened it. Not just counts — analysis. Not just data — recommendations.

And I wanted it to do this without me writing a hundred if-else rules. I wanted the AI to figure it out.

---

## Choosing the Architecture: Why a Separate Python Service

Here is the first real decision I had to make, and I think it is the one most MERN developers get wrong when they start adding AI features.

The temptation is to add an LLM call inside your Express route handler. Import an SDK. Make a function call. Return the result. Done.

I tried that. For about a day.

The problem is threefold. First, JavaScript's AI ecosystem in 2026 is good, but Python's is better. LangGraph, LangChain, the entire orchestration tooling — it is built for Python first. Second, LLM calls are slow. A full analysis pipeline takes 8 to 12 seconds. You do not want that blocking your Express event loop, even with async patterns. Third, AI logic evolves differently than application logic. My task CRUD endpoints change maybe once a month. My AI prompts and agent configurations change every week. They need independent deployment cycles.

So I went with a microservice architecture:

```
React Client (Port 5173)
    ↕ HTTP / JSON / JWT
Express API Server (Port 5000)
    ↕ HTTP / JSON / JWT          ↕ MongoDB Driver
FastAPI AI Swarm (Port 8000)     MongoDB (Port 27017)
    ↕ OpenRouter API / Ollama
Cloud LLM or Local LLM
```

The Express server becomes a proxy. The React client never talks to the Python service directly. Everything goes through the existing Express authentication middleware, which means I didn't have to rebuild auth for the AI layer.

This single decision — keeping Express as the gateway — saved me from at least a dozen security headaches later.

---

## Laying the Foundation: The AI Swarm Folder Structure

I created a new top-level directory called `ai-swarm` right next to `client/` and `server/`. Here is what it looked like after the initial scaffold:

```
ai-swarm/
├── api/
│   └── main.py            # FastAPI application entry point
├── orchestration/
│   ├── state.py            # LangGraph state schema (TypedDict)
│   └── graph_builder.py    # The state machine that runs everything
├── mcp_servers/
│   ├── base.py             # Base class for all MCP tool servers
│   ├── task_retriever.py   # Fetches tasks and workloads
│   ├── project_auditor.py  # Audits health and detects risks
│   └── report_synthesizer.py  # Compiles natural language summaries
├── agents/
│   ├── __init__.py
│   └── base_agent.py       # Unified LLM query function
├── security/
│   └── policies.rego       # OPA policy rules for tool access
├── config.py               # Pydantic settings with env loading
├── requirements.txt
├── run.py                  # Startup validator
└── .env
```

Three things jump out from this structure. One, there is a clear separation between *how* the agents think (the `orchestration/` folder), *what tools* they can use (the `mcp_servers/` folder), and *who is allowed to use what* (the `security/` folder). Two, the `api/` layer is thin — it just translates HTTP requests into orchestrator calls. Three, the entire service is self-contained. It has its own config, its own dependencies, its own environment variables.

This separation matters more than most tutorials will tell you. When something breaks at 2 AM in production — and it will — you want to know *exactly* which layer failed.

---

## Building the Intelligence: LangGraph State Machine

This is where things get interesting.

Most people who add AI to their app do it in a straight line: get data, send it to an LLM, return the response. One hop. That works for simple questions. But for real analysis — the kind where you need to pull data from multiple sources, cross-reference it, reason about it, and then format a coherent recommendation — you need a pipeline.

I used **LangGraph** to build a four-node directed graph:

```
[retrieve_data] → [analyze] → [synthesize] → [finalize] → END
```

Each node is an async function. Each one reads from and writes to a shared state object. Here is what that state looks like:

```python
from typing import TypedDict, List, Optional

class AgentState(TypedDict, total=False):
    query: str
    user_id: str
    project_id: str
    contract_id: str
    jwt_token: str
    context: str  # 'dashboard', 'task-assignment', 'contract-audit'

    # Processing
    retrieved_data: dict
    analysis: str
    recommendations: List[dict]

    # Output
    final_response: str
    confidence: float

    # Metadata
    steps_executed: List[str]
    errors: List[str]
```

The beauty of this `TypedDict` is that every node knows exactly what data is available and what it should produce. The `steps_executed` list acts as an execution trace — when something goes wrong, I can see exactly which nodes ran and which didn't.

Here is the graph construction:

```python
from langgraph.graph import StateGraph, END

workflow = StateGraph(AgentState)

workflow.add_node("retrieve_data", self._node_retrieve_data)
workflow.add_node("analyze", self._node_analyze)
workflow.add_node("synthesize", self._node_synthesize)
workflow.add_node("finalize", self._node_finalize)

workflow.add_edge("retrieve_data", "analyze")
workflow.add_edge("analyze", "synthesize")
workflow.add_edge("synthesize", "finalize")
workflow.add_edge("finalize", END)

workflow.set_entry_point("retrieve_data")
graph = workflow.compile()
```

This compiles into an executable graph. When a query comes in, I just call `await graph.ainvoke(initial_state)` and the whole pipeline runs.

### What Each Node Actually Does

**Node 1 — Retrieve Data**: This is where the MCP servers come in. Depending on the `context` field (dashboard analysis, task assignment, or contract audit), this node calls different tool servers to fetch real-time data from the Express API. For a dashboard request, it grabs user workloads, project health metrics, risk assessments, and overdue tasks — all in parallel.

```python
workload = await task_retriever.call_tool(
    'get_user_workload',
    user_id=state['user_id'],
    jwt_token=jwt_token
)
health = await project_auditor.call_tool(
    'audit_project_health',
    project_id=project_id,
    jwt_token=jwt_token
)
risks = await project_auditor.call_tool(
    'detect_team_risks',
    project_id=project_id,
    jwt_token=jwt_token
)
```

**Node 2 — Analyze**: Takes the raw data, formats it into a structured prompt, and sends it to the LLM for a 3-4 sentence professional analysis.

**Node 3 — Synthesize**: This is where the recommendations live. For dashboard contexts, it generates strategic project improvement suggestions. For task assignments, it recommends the best assignee based on current workloads and returns a scored list.

**Node 4 — Finalize**: Packages everything into a clean response, calculates a confidence score (0.85 for clean runs, 0.60 if errors occurred), and returns the complete report.

---

## The MCP Pattern: Giving Agents Access to Real Data

Here's a concept that took me a while to internalize: an LLM is useless without context. You can have the smartest model in the world, but if it doesn't know what tasks are in your project, it can't analyze them.

The **Model Context Protocol (MCP)** pattern solves this. Think of MCP servers as specialized tool kits that your AI agents can reach into. Each server exposes a set of tools — functions with names, descriptions, and handlers — that agents can call programmatically.

I built three MCP servers:

**TaskRetrieverServer** — Five tools for pulling task data:
- `get_tasks_by_project`: Fetches all tasks for a project
- `get_user_workload`: Calculates how many tasks (todo, in-progress, done) a user has
- `get_overdue_tasks`: Filters for tasks past their due date
- `get_project_members`: Retrieves team members for workload comparison
- `get_contract_by_id`: Pulls contract text for compliance analysis

**ProjectAuditorServer** — Two tools for health analysis:
- `audit_project_health`: Computes completion rates and health status
- `detect_team_risks`: Identifies overloaded users and recommends redistribution

**ReportSynthesizerServer** — One tool for summaries:
- `generate_summary`: Produces a formatted project snapshot

Here is what the base class looks like:

```python
class BaseMCPServer:
    def __init__(self, name: str):
        self.name = name
        self.tools = {}

    def register_tool(self, name: str, description: str, handler: Callable):
        self.tools[name] = {
            "description": description,
            "handler": handler
        }

    async def call_tool(self, tool_name: str, **kwargs) -> Any:
        if tool_name not in self.tools:
            raise ValueError(f"Tool {tool_name} not found")
        return await self.tools[tool_name]["handler"](**kwargs)

    async def _call_express_api(self, method, endpoint, **kwargs):
        async with httpx.AsyncClient() as client:
            url = f"{settings.EXPRESS_API_URL}{endpoint}"
            # ... make the HTTP call to Express
```

The critical detail here: these MCP servers don't talk to MongoDB directly. They call the *Express API*. The same API that the React frontend uses. This means every data access goes through existing authentication middleware, validation, and rate limiting. No backdoors.

This was a deliberate design choice. I could have given the Python service direct MongoDB access (and I did configure the connection string for it). But routing through Express meant I didn't have to duplicate any data access logic, and every request was automatically validated by the same JWT middleware that protects the frontend.

---

## The LLM Layer: Ollama for Dev, OpenRouter for Prod

One of the most practical decisions I made was building a dual-backend LLM routing system. During development, I used **Ollama** running TinyLlama locally — no API costs, instant responses, and it works offline. For production, I switch to **OpenRouter**, which gives me access to models like DeepSeek-R1 and others through a single API key.

The routing logic lives in a single function:

```python
async def query_llm(messages, model=None, format=None):
    if settings.USE_OPENROUTER and settings.OPENROUTER_API_KEY:
        # Route to OpenRouter cloud
        target_model = model
        if not target_model or "/" not in target_model:
            target_model = settings.OPENROUTER_MODEL or "openrouter/auto"

        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=60.0
        )
        # ... parse response
    else:
        # Fall back to local Ollama
        client = ollama.AsyncClient(host=settings.OLLAMA_BASE_URL)
        response = await client.chat(model=model or settings.MODEL, messages=messages)
```

The fallback chain is important. If OpenRouter returns a 404 (invalid model), it retries with `openrouter/auto`. If that still fails, it falls back to local Ollama. If Ollama is not running, *then* it throws an error.

A single environment variable controls which path fires:

```env
USE_OPENROUTER=false    # Local development with Ollama
USE_OPENROUTER=true     # Production with cloud LLMs
```

This meant I could develop the entire pipeline on a plane without Wi-Fi, then flip one flag for deployment. No code changes required.

---

## The Express Bridge: Proxy Routes That Connect Two Worlds

With the Python service running independently, I needed a clean way for my React frontend to trigger AI features. The answer was a set of proxy routes in Express that forward requests to the swarm.

Here is the core insight: the React client should never need to know that a Python service exists. It just calls `/api/ai/projects/:projectId/insights`, the same way it calls `/api/tasks` or `/api/projects`. Express handles the forwarding.

```javascript
// server/src/routes/aiRoutes.js
const SWARM_URL = process.env.SWARM_API_URL || 'http://localhost:8000/api/swarm';

router.get(
  '/projects/:projectId/insights',
  protect,  // JWT authentication middleware
  asyncHandler(async (req, res) => {
    const analytics = await getProjectAnalytics(projectId);

    const response = await axios.post(
      `${SWARM_URL}/query`,
      {
        query: analysisPrompt,
        project_id: projectId,
        user_id: req.user._id,
        context: 'dashboard-enhanced'
      },
      {
        headers: {
          Authorization: `Bearer ${req.headers.authorization?.split(' ')[1]}`
        }
      }
    );

    res.json({
      success: true,
      insights: response.data.analysis,
      analytics: analytics,
      confidence: response.data.confidence,
      executionTrace: response.data.execution_trace
    });
  })
);
```

Notice that the Express route does two things before forwarding to the swarm. First, it runs `protect` middleware — which means the request is already authenticated. Second, it computes its own `analytics` object with health scores, risk factors, and velocity metrics. This server-side pre-computation means the LLM gets structured data instead of raw database dumps, which dramatically improves response quality.

I registered these routes with a single line in my Express app configuration:

```javascript
app.use('/api/ai', aiRoutes);
```

Three endpoint families:
- `GET /api/ai/projects/:projectId/insights` — Dashboard AI analysis
- `GET /api/ai/tasks/:taskId/recommendations` — Smart task assignment
- `POST /api/ai/contracts/:contractId/analyze` — Legal compliance auditing (admin only)

---

## Security: OPA Policies for AI Tool Access

I needed to prevent a regular team member from accidentally (or intentionally) triggering a contract compliance audit. That is admin-level functionality, and it touches sensitive organizational documents.

Rather than scattering role checks across every agent, I centralized authorization using **Open Policy Agent (OPA)** style policies written in Rego:

```rego
package agent_access

# Admin can access everything
allow_admin {
    input.user.role == "admin"
}

# Members can only access public contracts
allow_member_public {
    input.user.role == "member"
    input.tool == "analyze_contract"
    input.contract.status == "public"
}

# Allow data retrieval for all authenticated users
allow_retrieval {
    input.tool == "get_tasks_by_project"
    input.user.authenticated == true
}
```

The policy logic is declarative. When an agent tries to use a tool, it checks the policy. Admins get unrestricted access. Members can analyze contracts only if they are public. Everyone can retrieve task data as long as they are authenticated.

This separation means I can add new tools without touching security code — I just update the policy file.

---

## The Part Nobody Warns You About: Deployment Debugging

Everything worked beautifully on localhost. Three terminals. Three services. Clean logs. Fast responses.

Then I deployed to production.

The React client went to **Vercel**. The Express server went to **Render**. The Python AI Swarm went to a separate **Render** web service. And that is when the fun started.

### The 404 That Cost Me an Evening

My first deployment looked perfect. All services were live. Green checkmarks everywhere. Then I clicked "Get AI Insights" on the dashboard, and the console lit up with `500 Internal Server Error`.

I pulled up the Render logs for the Express service:

```
GET /api/ai/projects/69f3a89e.../insights 500
```

And on the Python side:

```
INFO: 74.220.48.235:0 - "POST /api/swarm/query/query HTTP/1.1" 404 Not Found
```

See it? `/api/swarm/query/query`. The path was doubled. My `SWARM_API_URL` environment variable on Render was set to `https://team-task-manager-ai-swarm.onrender.com/api/swarm`, and my Express route was appending `/query` to that, giving me `/api/swarm/query`. But somewhere in the chain, the path was getting doubled.

The fix was embarrassingly simple: I had a trailing path segment in my env variable that was duplicating when Express concatenated it. I corrected the `SWARM_API_URL` to the base path and everything worked.

Lesson learned: **always log the full constructed URL before making a cross-service HTTP call in production**. What seems obvious on localhost becomes invisible when your services are separated by load balancers.

### The 429 That Meant I Was Moving Too Fast

The second production issue was subtler. After fixing the routing, insights loaded — but intermittently. Some requests returned beautiful AI analysis. Others returned:

```json
{"error": "Request failed with status code 429"}
```

HTTP 429 means "Too Many Requests." The OpenRouter API was rate-limiting me. My LangGraph pipeline makes *two* LLM calls per request (one for analysis, one for synthesis), and with a free-tier API key, I was hitting the ceiling with just a few concurrent users.

The fix was twofold: I switched to a model on OpenRouter's free tier (`deepseek/deepseek-r1:free`) that had higher rate limits, and I added the fallback chain in `base_agent.py` so that if the primary model gets rate-limited, the system automatically retries with `openrouter/auto`.

This taught me something fundamental about AI microservices: **your LLM provider is a dependency, and it has its own failure modes**. Treat it like you would a flaky database connection — with retries, fallbacks, and circuit breakers.

---

## The UI Layer: Making AI Features Feel Native

I am not going to walk through every React component, but I want to highlight one design principle that made a big difference: AI features should feel like a natural part of the interface, not a bolted-on novelty.

On the project dashboard, AI insights appear alongside traditional analytics. The same card layout, the same color scheme, the same loading patterns. Users click "Get AI Insights," see a spinner (those 8–12 seconds matter), and the recommendations appear inline — formatted identically to the manually created project summary above them.

For the onboarding experience, I built a **Bento Promo Panel** that appears on the login and signup screens. It is a glassmorphic card grid that describes the platform's four pillars:

1. **Core Platform** — RBAC, Kanban boards, JWT authentication
2. **Swarm Engine** — LangGraph orchestration, FastAPI service layer
3. **Intelligent Insights** — Workload recommendations, contract audits
4. **Service Topology** — Visual map of ports 5173, 5000, and 8000

The entire UI uses a dark slate gradient (`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900`) with glassmorphic panels (`backdrop-blur-md`) and glowing teal accents (`text-teal-400`). Every interactive element pulses subtly on hover. The brand text uses a teal-to-emerald gradient that stays readable on every laptop screen I tested.

These details sound cosmetic, but they matter for trust. If the AI recommendation card looks polished and intentional, users take the output seriously. If it looks like a debug console dump, they ignore it.

---

## What the Final System Looks Like in Practice

When a team lead opens their project dashboard and clicks "Get AI Insights," here's what happens under the hood:

1. **React** sends `GET /api/ai/projects/:id/insights` to Express (Port 5000)
2. **Express** authenticates the JWT, computes server-side analytics, builds a detailed prompt, and forwards `POST /api/swarm/query` to FastAPI (Port 8000)
3. **FastAPI** passes the query to the LangGraph orchestrator
4. **Node 1 (Retrieve)**: MCP servers call back to Express to fetch workloads, health data, risks, and overdue tasks
5. **Node 2 (Analyze)**: The LLM receives the structured data and produces a professional analysis
6. **Node 3 (Synthesize)**: A second LLM call generates prioritized, actionable recommendations
7. **Node 4 (Finalize)**: Everything is packaged with a confidence score and execution trace
8. The response travels back: FastAPI → Express → React → rendered in a glassmorphic card

End-to-end latency in production: **8 to 12 seconds**. That includes two LLM inference calls, four MCP tool invocations, and three cross-service HTTP round trips.

For contract analysis, the pipeline is similar but the tools and prompts are different. A legal compliance audit runs through the same graph, but Node 1 fetches contract text instead of task data, and Node 3 produces compliance risk highlights instead of workload recommendations.

---

## Numbers From Production

After running the system for two weeks in a testing environment with real project data:

| Metric | Value |
|--------|-------|
| Average insight generation time | 11.2 seconds |
| Contract analysis time | 7.8 seconds |
| LLM calls per insight request | 2 |
| MCP tool invocations per request | 4-5 |
| Cross-service HTTP calls | 6-8 |
| Average confidence score | 0.85 |
| Fallback to Ollama triggered | 3 times |

The confidence score drops to 0.60 when any node encounters an error. In production, this happened twice — once due to a rate limit and once due to a network timeout between Render instances.

---

## Five Things I Would Do Differently

**1. Add a caching layer.** Project health data doesn't change every second. A 5-minute Redis cache between Express and the Swarm would cut latency for repeated requests by 80%.

**2. Use WebSockets for the AI response.** Right now, the user clicks a button and waits 12 seconds. A streaming response via WebSocket would show partial results as the pipeline progresses — analysis appearing while synthesis is still running.

**3. Deploy on the same infrastructure.** Having Express on Render and the AI Swarm on a separate Render service introduces cross-instance latency. Co-locating them in a Docker Compose setup on a single VPS would be faster and cheaper.

**4. Add structured logging from Day 1.** I retrofitted execution traces later. Having structured JSON logs with request IDs flowing through all three services from the start would have saved hours of debugging.

**5. Rate limit the AI endpoints at the Express level.** I got rate-limited by OpenRouter because I had no throttling on my own side. Adding a simple `express-rate-limit` middleware on `/api/ai/*` routes would have prevented cascading failures.

---

## What I Learned About Bridging Node.js and Python

The biggest takeaway from this project is not about any specific library or framework. It is this: **adding AI to a traditional web app is an integration problem, not an AI problem.**

The LLM part — the prompts, the model selection, the temperature tuning — that was maybe 15% of the total effort. The other 85% was plumbing: getting authentication tokens to flow across service boundaries, making sure CORS headers were right, debugging URL construction in production, handling timeouts, building fallback chains, and making the whole thing feel instantaneous to users even though eight network calls are happening behind the scenes.

If you are a MERN developer looking to add AI features, start with the plumbing. Get two services talking to each other with shared authentication. Build a health check route. Deploy it. Make sure the wiring works. Then — and only then — start wiring in the LLM.

The AI is the easy part. The integration is where the real engineering lives.

---

## Try It Yourself

The entire project is open source:

**GitHub**: [github.com/anan5093/team-task-manager](https://github.com/anan5093/team-task-manager)

**Live Demo**: [team-task-manager-lac.vercel.app](https://team-task-manager-lac.vercel.app)

The repository includes:
- Complete MERN stack application with Kanban boards and real-time analytics
- Python AI Swarm microservice with LangGraph orchestration
- Three MCP tool servers for data retrieval and analysis
- OPA-based security policies
- Step-by-step learning path documentation (`docs/AI_INTEGRATION_LEARNING_PATH.md`)
- End-to-end integration testing report (`docs/TESTING_REPORT.md`)

If you build something with this architecture, I would genuinely love to hear about it. Find me on [LinkedIn](https://www.linkedin.com/in/anand-raj-006a41217/) or reach out at anand.ar1806@gmail.com.

---

*If this article helped you understand how to integrate AI microservices with your existing web application, consider following me on Medium for more deep dives into full-stack AI integration, multi-agent orchestration, and MERN stack architecture.*


