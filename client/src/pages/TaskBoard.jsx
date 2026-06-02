import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AIRecommendations from '../components/AIRecommendations.jsx';

import api from '../api/axios.js';
import { Button } from '../components/Button.jsx';
import { Input, Select, Textarea } from '../components/Input.jsx';
import { Loading } from '../components/Loading.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { apiErrorMessage, formatDate, isOverdue } from '../utils/formatters.js';

const statuses = [
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' }
];

const today = new Date().toISOString().slice(0, 10);

const TaskBoard = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ project: '', user: '' });
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    dueDate: today,
    project: '',
    assignedUser: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
  setLoading(true);
  setError('');

  // 🔥 sanitize filters (ONLY FIX)
  const params = {};
  if (filters.project) params.project = filters.project;
  if (filters.user) params.user = filters.user;

  try {
    const [taskRes, projectRes, userRes] = await Promise.all([
      api.get('/tasks', { params }),
      api.get('/projects'),
      api.get('/users')
    ]);
      setTasks(taskRes.data);
      setProjects(projectRes.data);
      setUsers(userRes.data);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters.project, filters.user]);

  const usersByProject = useMemo(() => {
    const project = projects.find((item) => item._id === form.project);
    return project ? project.members : users;
  }, [form.project, projects, users]);

  const createTask = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.title || !form.project || !form.assignedUser || !form.dueDate) {
      setError('Title, project, assigned user, and due date are required.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/tasks', form);
      setForm({ title: '', description: '', status: 'todo', dueDate: today, project: '', assignedUser: '' });
      await loadData();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (task, status) => {
    await api.put(`/tasks/${task._id}`, { status });
    await loadData();
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`);
    await loadData();
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Task Board</h1>
          <p className="mt-1 text-sm text-slate-500">Track tasks by status and ownership.</p>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[520px]">
          <Select label="Project" value={filters.project} onChange={(e) => setFilters({ ...filters, project: e.target.value })}>
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </Select>
          <Select label="User" value={filters.user} onChange={(e) => setFilters({ ...filters, user: e.target.value })}>
            <option value="">All users</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {error ? <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {isAdmin ? (
        <form onSubmit={createTask} className="mb-6 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-4 lg:grid-cols-3">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Select label="Project" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value, assignedUser: '' })}>
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </Select>
            <Select label="Assigned user" value={form.assignedUser} onChange={(e) => setForm({ ...form, assignedUser: e.target.value })}>
              <option value="">Select user</option>
              {usersByProject.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </Select>
            {form.project && (
              <AIRecommendations 
                taskId={form.project} 
                onSelect={(userId) => {
                  setForm({...form, assignedUser: userId});
                }}
              />
            )}
            <Input label="Due date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Select>
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <Button type="submit" className="mt-5" disabled={saving}>
            <Plus size={16} />
            {saving ? 'Creating...' : 'Create task'}
          </Button>
        </form>
      ) : null}

      {loading ? (
        <Loading label="Loading tasks" />
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          {statuses.map((status) => (
            <section key={status.value} className="min-h-96 rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-ink">{status.label}</h2>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                  {tasks.filter((task) => task.status === status.value).length}
                </span>
              </div>
              <div className="space-y-3">
                {tasks
                  .filter((task) => task.status === status.value)
                  .map((task) => (
                    <article key={task._id} className="rounded-md border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-ink">{task.title}</h3>
                        {isAdmin ? (
                          <button className="focus-ring rounded-md p-1 text-red-600 hover:bg-red-50" onClick={() => deleteTask(task._id)}>
                            <Trash2 size={15} />
                          </button>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-slate-500">{task.description || 'No description.'}</p>
                      <div className="mt-4 grid gap-2 text-xs text-slate-500">
                        <span>Project: {task.project?.name}</span>
                        <span>Assigned: {task.assignedUser?.name}</span>
                        <span className={isOverdue(task) ? 'font-semibold text-red-600' : ''}>Due: {formatDate(task.dueDate)}</span>
                      </div>
                      <Select
                        label="Move status"
                        value={task.status}
                        onChange={(e) => updateStatus(task, e.target.value)}
                      >
                        {statuses.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </Select>
                    </article>
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
