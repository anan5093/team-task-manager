# Team Task Manager

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-%3E%3D3.8-3776AB?logo=python&logoColor=white)](https://www.python.org/)

Team Task Manager is a full-stack project management app for teams that need role-based planning, task tracking, and AI-assisted insights in one workspace.

## Table of Contents

- [What this project does](#what-this-project-does)
- [Why this project is useful](#why-this-project-is-useful)
- [How to get started](#how-to-get-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment setup](#environment-setup)
  - [Run the services](#run-the-services)
- [Usage examples](#usage-examples)
- [Project structure](#project-structure)
- [Where to get help](#where-to-get-help)
- [Who maintains and contributes](#who-maintains-and-contributes)

## What this project does

The platform combines:

- **Team operations**: authentication, user roles, projects, tasks, and dashboards
- **Contract workflows**: contract records with access-level controls
- **AI Swarm integration**: project insights, task recommendations, and contract analysis through a Python microservice

Core stack:

- **Frontend**: React + Vite + Tailwind (`/client`)
- **Backend API**: Node.js + Express + MongoDB (`/server`)
- **AI service**: FastAPI + LangGraph + MCP-style tools (`/ai-swarm`)

## Why this project is useful

- **Role-based control** (`admin`, `member`) for safer team operations
- **Kanban-style execution flow** with task statuses (`todo`, `in-progress`, `done`)
- **Actionable dashboard metrics** (total, completed, overdue, filtered views)
- **Built-in security defaults** (Helmet, CORS controls, rate limiting, JWT auth)
- **AI-assisted decisions** for project health and contract-risk visibility

## How to get started

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB 6+
- Python 3.8+ (for `ai-swarm`)
- Optional: Ollama (for local LLM runs)

### Installation

```bash
git clone https://github.com/anan5093/team-task-manager.git
cd team-task-manager

npm install
npm install --prefix server
npm install --prefix client

python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r ai-swarm/requirements.txt
```

### Environment setup

Create `/tmp/workspace/anan5093/team-task-manager/server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/team-task-manager
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
SWARM_API_URL=http://localhost:8000/api/swarm
```

Create `/tmp/workspace/anan5093/team-task-manager/client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Create `/tmp/workspace/anan5093/team-task-manager/ai-swarm/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/team-task-manager
EXPRESS_API_URL=http://localhost:5000/api
FASTAPI_PORT=8000
JWT_SECRET=replace-with-the-same-server-secret
AI_SERVICE_SECRET=shared-secret
OLLAMA_BASE_URL=http://localhost:11434
MODEL=tinyllama
USE_OPENROUTER=false
```

### Run the services

Run web app (API + client):

```bash
npm run dev
```

Run AI Swarm in another terminal:

```bash
cd ai-swarm
python run.py
```

Service URLs:

- Frontend: `http://localhost:5173`
- Express API health: `http://localhost:5000/health`
- AI service health: `http://localhost:8000/health`

## Usage examples

1. Sign up your first account (it becomes `admin` automatically).
2. Create a project and assign members.
3. Create tasks and move them through board statuses.
4. Use dashboard filters for member/project progress.
5. Open contracts and trigger AI analysis from contract/project views.

API quick start:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

```bash
# Fetch tasks with a token
curl "http://localhost:5000/api/tasks?status=todo" \
  -H "Authorization: ******"
```

```bash
# Query the AI Swarm service
curl -X POST http://localhost:8000/api/swarm/query \
  -H "Authorization: ******" \
  -H "Content-Type: application/json" \
  -d '{"query":"What is my workload?","user_id":"<user-id>","context":"dashboard"}'
```

## Project structure

```text
team-task-manager/
├── client/          # React frontend
├── server/          # Express + MongoDB API
├── ai-swarm/        # FastAPI multi-agent service
└── docs/            # Supporting project docs
```

Useful docs:

- `docs/AI_INTEGRATION_LEARNING_PATH.md`
- `docs/TESTING_REPORT.md`
- `docs/DEV_TRACKING.md`
- `SECURITY.md`

## Where to get help

- Open issues: <https://github.com/anan5093/team-task-manager/issues>
- Ask in discussions: <https://github.com/anan5093/team-task-manager/discussions>
- Security concerns: see `SECURITY.md`

## Who maintains and contributes

- **Maintainer**: [@anan5093](https://github.com/anan5093)
- **Contributions welcome** via pull requests

Contribution flow:

1. Fork the repository
2. Create a feature branch
3. Run available checks before opening your PR:
   - `npm run lint --prefix server`
   - `npm run lint --prefix client`
   - `npm run build --prefix client`
4. Open a PR with a clear summary and testing notes
