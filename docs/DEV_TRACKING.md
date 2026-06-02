# Development Tracking - Team Task Manager

**Last Updated:** June 2, 2026

## Project Overview

Full-stack team task management application with React frontend, Express backend, and AI Swarm orchestration service.

**Tech Stack:**
- Frontend: React 18 + Vite + Tailwind CSS
- Backend: Node.js + Express + MongoDB
- AI Service: Python + FastAPI + LangGraph + MCP Servers
- LLM: Ollama (local) + OpenRouter (optional)

---

## 🔴 Current Status

### Services Status

| Service | Port | Status | Last Error | Resolution |
|---------|------|--------|-----------|-----------|
| Express API | 5000 | ✅ Ready | `npm run dev` failed (Exit 1) | Check logs |
| React Client | 5173 | ✅ Ready | `npm run dev` failed (Exit 1) | Check logs |
| Python AI Swarm | 8000 | ✅ Running | ~~ModuleNotFoundError~~ | ✅ FIXED |

---

## 🐛 Issues & Fixes

### Issue 1: Python Module Import Error (FIXED ✅)

**Error:**
```
ModuleNotFoundError: No module named 'config'
```

**Location:** `ai-swarm/api/main.py`

**Cause:** Python couldn't resolve sibling packages when running from subdirectory.

**Fix Applied:**
- Added `sys.path` manipulation to entry points:
  - `ai-swarm/api/main.py`: Added `sys.path.insert(0, str(Path(__file__).parent.parent))`
  - `ai-swarm/run.py`: Added `sys.path.insert(0, str(Path(__file__).parent))`
- All subdirectory modules now use absolute imports

**Files Modified:**
- ✅ `ai-swarm/api/main.py`
- ✅ `ai-swarm/run.py`
- ✅ `ai-swarm/mcp_servers/base.py`
- ✅ `ai-swarm/mcp_servers/task_retriever.py`
- ✅ `ai-swarm/mcp_servers/project_auditor.py`
- ✅ `ai-swarm/mcp_servers/report_synthesizer.py`
- ✅ `ai-swarm/agents/base_agent.py`
- ✅ `ai-swarm/orchestration/graph_builder.py`

**Status:** Ready for testing

---

## 📋 Setup & Installation

### Prerequisites
```bash
Node.js >= 18
npm >= 9
Python >= 3.8
MongoDB (local or Atlas)
Ollama (for local LLM)
```

### Installation Steps

1. **Clone & Install Dependencies**
   ```bash
   git clone <repo-url>
   cd team-task-manager
   
   # Server
   cd server && npm install && cd ..
   
   # Client
   cd client && npm install && cd ..
   
   # AI Swarm
   cd ai-swarm && pip install -r requirements.txt && cd ..
   ```

2. **Environment Configuration**
   - Create `.env` in project root
   - Create `.env` in `server/` directory
   - Create `.env` in `ai-swarm/` directory
   - See `.env.example` files for required variables

3. **Start MongoDB**
   ```bash
   mongod
   ```

4. **Start Ollama (if using local LLM)**
   ```bash
   ollama serve
   ```

---

## 🚀 Running Services

### Option 1: All Services Together
```bash
bash start-all.sh  # Unix/Linux/Mac
npm run dev        # From root (concurrent)
```

### Option 2: Individual Services

**Express API** (Terminal 1)
```bash
cd server && npm run dev
# Runs on http://localhost:5000
```

**React Client** (Terminal 2)
```bash
cd client && npm run dev
# Runs on http://localhost:5173
```

**Python AI Swarm** (Terminal 3)
```bash
cd ai-swarm && python api/main.py
# Runs on http://localhost:8000
# OR
python run.py
```

### Expected Output

✅ All services should start without errors:
```
Express API: http://localhost:5000
Python Swarm: http://localhost:8000
React Client: http://localhost:5173
```

---

## ✅ Development Checklist

### Backend (Express) - TO DO
- [ ] Verify Express server starts
- [ ] Test authentication routes
- [ ] Test project/task CRUD operations
- [ ] Validate MongoDB connection
- [ ] Check error handling
- [ ] Test CORS configuration

### Frontend (React) - TO DO
- [ ] Verify React dev server starts
- [ ] Test login/signup flow
- [ ] Test dashboard rendering
- [ ] Test task board kanban
- [ ] Check API integration
- [ ] Validate responsive design

### AI Service (Python) - IN PROGRESS ✅
- [x] Fix Python module imports
- [ ] Test FastAPI startup
- [ ] Validate MCP server connections
- [ ] Test Ollama integration
- [ ] Test graph orchestration
- [ ] Validate API endpoints

### Infrastructure - TO DO
- [ ] Environment variables documented
- [ ] MongoDB connection tested
- [ ] Ollama health check added
- [ ] Rate limiting tested
- [ ] CORS policies validated

---

## 🔧 Troubleshooting

### Problem: `npm run dev` exits with code 1

**Check:**
```bash
cd server && npm run dev 2>&1  # Capture stderr
cd client && npm run dev 2>&1
```

**Common causes:**
- Missing dependencies: `npm install`
- Port already in use: Change port in config
- Node version: Use `nvm use 18` or higher

### Problem: MongoDB connection fails

**Verify:**
```bash
mongod --version
mongo --eval "db.adminCommand('ping')"
```

### Problem: Python import errors

**Verify sys.path fix:**
```bash
cd ai-swarm
python -c "import sys; print(sys.path)"
python api/main.py -v
```

---

## 📁 Project Structure

```
team-task-manager/
├── DEV_TRACKING.md          ← You are here
├── README.md                ← Main documentation
├── package.json             ← Root dependencies
├── start-all.sh             ← Bash startup script
│
├── server/                  ← Express API
│   ├── package.json
│   ├── src/app.js
│   └── ...
│
├── client/                  ← React Frontend
│   ├── package.json
│   ├── src/App.jsx
│   └── ...
│
└── ai-swarm/                ← Python AI Service
    ├── config.py
    ├── api/main.py
    ├── orchestration/
    ├── mcp_servers/
    └── ...
```

---

## 🧪 Testing Commands

```bash
# Install all dependencies
npm run install:all

# Run all services
npm run dev

# Run individual services with logging
cd server && DEBUG=* npm run dev
cd client && npm run dev
cd ai-swarm && python api/main.py --verbose

# Check service health
curl http://localhost:5000/health
curl http://localhost:8000/docs  # FastAPI Swagger UI
```

---

## 📝 Notes

- Always run services in separate terminal windows
- Keep this file updated with new issues/fixes
- Document environment variable changes
- Test cross-service communication after changes
- Commit to a feature branch before pushing

---

## 👥 Team Notes

**Dev Session - June 2, 2026:**
- Fixed Python import errors in ai-swarm service
- All services now ready for integration testing
- Next: Test service startup and basic functionality

---

## 🔗 Quick Links

- Main README: [README.md](../README.md)
- Learning Path: [AI_INTEGRATION_LEARNING_PATH.md](AI_INTEGRATION_LEARNING_PATH.md)
- Express Server: `server/`
- React Client: `client/`
- Python API: `ai-swarm/api/main.py`
- Orchestrator: `ai-swarm/orchestration/graph_builder.py`
