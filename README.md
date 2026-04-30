# Team Task Manager

A production-ready full-stack team task manager built with React, Vite, Tailwind CSS, Node.js, Express, MongoDB, Mongoose, JWT, and bcrypt.

## Folder Structure

```text
team-task-manager/
├── package.json
├── README.md
├── server/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       │   └── db.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── projectController.js
│       │   ├── taskController.js
│       │   └── userController.js
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   ├── errorMiddleware.js
│       │   └── validateRequest.js
│       ├── models/
│       │   ├── Project.js
│       │   ├── Task.js
│       │   └── User.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── projectRoutes.js
│       │   ├── taskRoutes.js
│       │   └── userRoutes.js
│       └── utils/
│           ├── asyncHandler.js
│           └── generateToken.js
└── client/
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── index.css
        ├── main.jsx
        ├── api/
        │   └── axios.js
        ├── components/
        │   ├── Button.jsx
        │   ├── Input.jsx
        │   ├── Layout.jsx
        │   ├── Loading.jsx
        │   └── ProtectedRoute.jsx
        ├── context/
        │   └── AuthContext.jsx
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── Login.jsx
        │   ├── Projects.jsx
        │   ├── Signup.jsx
        │   └── TaskBoard.jsx
        └── utils/
            └── formatters.js
```

## API Routes

All protected routes require `Authorization: Bearer <token>`.

### Auth

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | Public | Create user; only the first account becomes admin |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/auth/me` | Authenticated | Get current user |
| POST | `/api/auth/logout` | Authenticated | Client-side logout acknowledgement |

### Users

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/users` | Authenticated | List users for assignment/filtering |
| PATCH | `/api/users/:id/role` | Admin | Update a user's role |

### Projects

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/projects` | Authenticated | List accessible projects |
| POST | `/api/projects` | Admin | Create project |
| GET | `/api/projects/:id` | Project member/Admin | Get project |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project and related tasks |

### Tasks

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/tasks?project=&user=&status=` | Authenticated | List tasks with filters |
| GET | `/api/tasks/stats?project=&user=` | Authenticated | Dashboard totals |
| POST | `/api/tasks` | Admin | Create task |
| PUT | `/api/tasks/:id` | Admin or assigned member | Update task/status |
| DELETE | `/api/tasks/:id` | Admin | Delete task |

## Local Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Create environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Update `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/team-task-manager
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

4. Start the app:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend health check: `http://localhost:5000/health`

## Railway Deployment

This repo can run as one Railway service.

Set these Railway environment variables:

```env
NODE_ENV=production
MONGO_URI=<your Railway MongoDB connection string>
JWT_SECRET=<long random production secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=<your Railway app URL>
```

Use these commands:

```bash
npm run install:all
npm run build
npm start
```

If Railway uses a single build command, set it to:

```bash
npm run railway:build
```

The Express server serves the built React app from `client/dist` in production and exposes the API under `/api`.

## Notes

- Passwords are hashed with bcrypt before saving.
- JWTs are stored client-side in `localStorage` and attached with Axios interceptors.
- Admin users can manage projects and create/delete tasks.
- Members can view their assigned work and update task status.
- Validation is handled with `express-validator`; errors are returned consistently by centralized middleware.
