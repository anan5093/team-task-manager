# Team Task Manager

![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-brightgreen?logo=node.js)
![npm](https://img.shields.io/badge/npm-%3E%3D9-blue?logo=npm)
![License](https://img.shields.io/badge/license-MIT-green)

A production-ready full-stack team task management application. Admins create projects, assign tasks, and manage members; team members track their work and update task status — all through a clean, responsive interface.

**Stack:** React 18 · Vite · Tailwind CSS · Node.js · Express · MongoDB · Mongoose · JWT · bcryptjs

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Support](#support)

## Features

- **Role-based access control** — Two roles: `admin` and `member`. The first account registered automatically becomes admin.
- **Project management** — Admins create and manage projects, add members, and delete projects (cascades to tasks).
- **Kanban task board** — Tasks move through three statuses: *To do*, *In progress*, and *Done*. Members can update the status of tasks assigned to them.
- **Dashboard** — Real-time stats (total tasks, completed, overdue) filterable by project and team member.
- **Secure authentication** — JWT tokens with configurable expiry; passwords hashed with bcryptjs (12 rounds).
- **Production-hardened API** — Helmet security headers, CORS, rate limiting (300 req / 15 min), and centralized error handling with `express-validator`.
- **Single-service deployment** — Express serves the built React app in production; no separate static host needed.

## Getting Started

### Prerequisites

| Tool | Version |
| --- | --- |
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| MongoDB | ≥ 6 (local or Atlas) |

### Installation

```bash
# Clone the repository
git clone https://github.com/anan5093/team-task-manager.git
cd team-task-manager

# Install root dependencies
npm install

# Install server dependencies
npm install --prefix server

# Install client dependencies
npm install --prefix client
```

### Environment Variables

Create `server/.env` with the following content:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/team-task-manager
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Create `client/.env` with the following content:

```env
VITE_API_URL=http://localhost:5000/api
```

### Running the App

```bash
npm run dev
```

This starts both the Express API server and the Vite dev server concurrently.

| Service | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| API health check | http://localhost:5000/health |

## Usage

1. **Sign up** — Register the first account (it automatically becomes admin). Additional accounts default to the `member` role.
2. **Create a project** *(admin only)* — Navigate to **Projects**, add a project name and description, and assign team members.
3. **Create tasks** *(admin only)* — Open the **Task Board**, fill in the task form (title, project, assigned user, due date), and click **Create task**.
4. **Track work** *(all users)* — Use the **Task Board** to see tasks grouped by status. Change a task's status via its dropdown. Overdue tasks are highlighted in red.
5. **Monitor progress** — The **Dashboard** shows total, completed, and overdue task counts. Use the project and user filters to narrow the view.
6. **Manage roles** *(admin only)* — Promote members to admin or demote admins to member via `PATCH /api/users/:id/role`.

## API Reference

All protected routes require the header:

```
Authorization: Bearer <token>
```

### Auth

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | Public | Register a user; first account becomes admin |
| POST | `/api/auth/login` | Public | Log in and receive a JWT |
| GET | `/api/auth/me` | Authenticated | Get the current user's profile |
| POST | `/api/auth/logout` | Authenticated | Client-side logout acknowledgement |

### Users

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/users` | Authenticated | List users (for assignment and filtering) |
| PATCH | `/api/users/:id/role` | Admin | Promote or demote a user's role |

### Projects

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/projects` | Authenticated | List accessible projects |
| POST | `/api/projects` | Admin | Create a project |
| GET | `/api/projects/:id` | Project member / Admin | Get a single project |
| PUT | `/api/projects/:id` | Admin | Update a project |
| DELETE | `/api/projects/:id` | Admin | Delete a project and its tasks |

### Tasks

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/tasks` | Authenticated | List tasks; supports `?project=&user=&status=` filters |
| GET | `/api/tasks/stats` | Authenticated | Dashboard counts; supports `?project=&user=` filters |
| POST | `/api/tasks` | Admin | Create a task |
| PUT | `/api/tasks/:id` | Admin or assigned member | Update task fields or move status |
| DELETE | `/api/tasks/:id` | Admin | Delete a task |

## Deployment

### Single-service (Railway, Render, Fly.io)

Express serves both the API and the built React app from a single process, making it straightforward to deploy on any Node.js-capable platform.

1. Connect your repository to your platform of choice.
2. Provision a MongoDB instance (a managed Atlas cluster or a platform plugin).
3. Set the following environment variables:

```env
NODE_ENV=production
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<long random production secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=<your deployed app URL>
```

4. Most platforms run `npm install` automatically in the root. Set the **build command** to install the sub-package dependencies and build the React client:

```bash
npm install --prefix server && npm install --prefix client && npm run build --prefix client
```

5. Set the **start command** to:

```bash
npm start
```

In production, Express serves the built React SPA from `client/dist` and handles all non-`/api` routes with `index.html` for client-side routing.

### Vercel (client only)

A `client/vercel.json` rewrite rule is included for deploying the React frontend to Vercel as a standalone SPA. In this configuration you will need to host the Express API separately and point `VITE_API_URL` at its public URL before building.

## Project Structure

```text
team-task-manager/
├── package.json          # Root scripts: dev (concurrent), start
├── server/
│   ├── package.json
│   └── src/
│       ├── app.js        # Express app setup (middleware, routes)
│       ├── server.js     # HTTP server entry point
│       ├── config/
│       │   └── db.js     # MongoDB connection
│       ├── controllers/  # Route handlers (auth, project, task, user)
│       ├── middleware/   # Auth guard, error handler, validation runner
│       ├── models/       # Mongoose schemas (User, Project, Task)
│       ├── routes/       # Express routers
│       └── utils/        # asyncHandler, generateToken
└── client/
    ├── index.html
    ├── package.json
    ├── vercel.json       # SPA rewrite rules for Vercel deployment
    ├── vite.config.js
    └── src/
        ├── App.jsx       # Route definitions
        ├── api/          # Axios instance with JWT interceptor
        ├── components/   # Button, Input, Layout, Loading, ProtectedRoute
        ├── context/      # AuthContext (login, logout, isAdmin)
        ├── pages/        # Dashboard, Login, Signup, Projects, TaskBoard
        └── utils/        # formatters (date, overdue detection)
```

## Contributing

Contributions are welcome! Please open an issue first to discuss your idea, then submit a pull request.

1. Fork the repository and create a feature branch.
2. Follow the existing code style (ESLint, consistent naming).
3. Write clear commit messages.
4. Open a pull request against `main` — describe what changed and why.

For significant changes, please open an issue first so we can discuss the approach.

## Support

- **Bugs & feature requests** — [Open a GitHub issue](https://github.com/anan5093/team-task-manager/issues)
- **Questions** — Use the [GitHub Discussions](https://github.com/anan5093/team-task-manager/discussions) tab

**Maintainer:** [@anan5093](https://github.com/anan5093)
