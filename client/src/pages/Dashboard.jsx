import { AlertTriangle, CheckCircle2, ListTodo } from 'lucide-react';
import { useEffect, useState } from 'react';

import api from '../api/axios.js';
import AIInsights from '../components/AIInsights.jsx';
import { Loading } from '../components/Loading.jsx';
import { Select } from '../components/Input.jsx';
import { apiErrorMessage } from '../utils/formatters.js';

const statCards = [
  { key: 'totalTasks', label: 'Total tasks', icon: ListTodo, color: 'text-brand' },
  { key: 'completedTasks', label: 'Completed', icon: CheckCircle2, color: 'text-emerald-600' },
  { key: 'overdueTasks', label: 'Overdue', icon: AlertTriangle, color: 'text-red-600' }
];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ project: '', user: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMeta = async () => {
      const [projectRes, userRes] = await Promise.all([
        api.get('/projects'),
        api.get('/users')
      ]);
      setProjects(projectRes.data);
      setUsers(userRes.data);
    };
    loadMeta().catch((err) => setError(apiErrorMessage(err)));
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError('');

      // ✅ FIX: sanitize filters (ONLY CHANGE)
      const params = {};
      if (filters.project) params.project = filters.project;
      if (filters.user) params.user = filters.user;

      try {
        const { data } = await api.get('/tasks/stats', { params });
        setStats(data);
      } catch (err) {
        setError(apiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [filters]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Task health across projects and teammates.
          </p>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[520px]">
          <Select
            label="Project"
            value={filters.project}
            onChange={(e) =>
              setFilters({ ...filters, project: e.target.value })
            }
          >
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </Select>

          <Select
            label="User"
            value={filters.user}
            onChange={(e) =>
              setFilters({ ...filters, user: e.target.value })
            }
          >
            <option value="">All users</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {error ? (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {loading ? (
        <Loading label="Loading dashboard" />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {statCards.map(({ key, label, icon: Icon, color }) => (
            <div
              key={key}
              className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-500">
                  {label}
                </p>
                <Icon className={color} size={22} />
              </div>
              <p className="mt-4 text-4xl font-bold text-ink">
                {stats?.[key] ?? 0}
              </p>
            </div>
          ))}
        </div>
      )}

      {filters.project && (
        <AIInsights projectId={filters.project} context="dashboard" />
      )}
    </div>
  );
};

export default Dashboard;
