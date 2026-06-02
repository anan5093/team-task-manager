# Contributing to Team Task Manager

Thank you for your interest in contributing to the Team Task Manager project! We welcome contributions from developers of all skill levels to help improve the application.

Please follow these guidelines to ensure a smooth contribution process.

---

## 🚀 How to Contribute

### 1. Find or Open an Issue
Before writing any code, check the existing issues or open a new one to discuss the feature, bug, or improvement you plan to work on. This ensures your efforts align with the project direction.

### 2. Fork the Repository
Fork the repository to your own GitHub account and clone it locally:
```bash
git clone https://github.com/YOUR-USERNAME/team-task-manager.git
cd team-task-manager
```

### 3. Create a Feature Branch
Create a branch named descriptively for the work you are performing:
```bash
git checkout -b feature/your-feature-name
# OR
git checkout -b bugfix/your-bugfix-name
```

### 4. Set Up the Environment
Follow the installation instructions in the [README.md](README.md) file to install dependencies for the root, frontend, backend, and AI Swarm services.

### 5. Follow Code Style & Standards
* **JavaScript (Client/Server)**: Follow clean ESLint guidelines, use ES Modules, and maintain async/await patterns using the centralized `asyncHandler`.
* **Python (AI Swarm)**: Use standard absolute imports, maintain Pydantic-based settings, and follow PEP 8 standards.
* **Security & Auth**: Never commit credentials, `.env` configurations, or mock API keys. Verify tool permissions using OPA policies in `ai-swarm/security/policies.rego`.

### 6. Commit Your Changes
Write clear, concise commit messages that describe *what* changed and *why*:
```bash
git commit -m "feat: integrate new task filter on dashboard"
```

### 7. Submit a Pull Request
Push your branch to your fork and submit a Pull Request (PR) against the `main` branch of the main repository. 
In your PR description, explain:
* The problem being solved or the feature added
* How you tested your changes (e.g., frontend layout validation, API integration traces)
* Any references to open issues (e.g., `Closes #12`)

---

## 🧪 Testing Your Changes

Before submitting your PR, please verify that all services run correctly and no integration links are broken:
1. Start Express Server, React Client, and Python AI Swarm concurrently.
2. Confirm the frontend loads at `http://localhost:5173`.
3. Verify that AI queries and insights run successfully without throwing CORS errors.
4. For more details on testing commands and logs, see [TESTING_REPORT.md](docs/TESTING_REPORT.md).

---

## ❓ Need Help?
If you have questions, feel free to open a thread under the **GitHub Discussions** tab or contact the maintainer:
* **Maintainer**: [@anan5093](https://github.com/anan5093)
