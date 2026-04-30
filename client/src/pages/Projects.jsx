import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import api from '../api/axios.js';
import { Button } from '../components/Button.jsx';
import { Input, Textarea } from '../components/Input.jsx';
import { Loading } from '../components/Loading.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { apiErrorMessage } from '../utils/formatters.js';

const emptyForm = { name: '', description: '', members: [] };

const Projects = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [projectRes, userRes] = await Promise.all([api.get('/projects'), api.get('/users')]);
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
  }, []);

  const toggleMember = (id) => {
    setForm((current) => ({
      ...current,
      members: current.members.includes(id)
        ? current.members.filter((memberId) => memberId !== id)
        : [...current.members, id]
    }));
  };

  const startEdit = (project) => {
    setEditingId(project._id);
    setForm({
      name: project.name,
      description: project.description || '',
      members: project.members.map((member) => member._id)
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.name.trim().length < 2) {
      setError('Project name must be at least 2 characters.');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, form);
      } else {
        await api.post('/projects', form);
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm('Delete this project and all related tasks?')) return;
    await api.delete(`/projects/${projectId}`);
    await loadData();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Projects</h1>
        <p className="mt-1 text-sm text-slate-500">Create project spaces and assign members.</p>
      </div>

      {error ? <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {isAdmin ? (
        <form onSubmit={handleSubmit} className="mb-6 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-4 lg:grid-cols-2">
            <Input label="Project name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-slate-700">Members</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <label key={user._id} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.members.includes(user._id)}
                    onChange={() => toggleMember(user._id)}
                  />
                  <span>{user.name}</span>
                  <span className="ml-auto text-xs text-slate-400">{user.role}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <Button type="submit" disabled={saving}>
              <Plus size={16} />
              {saving ? 'Saving...' : editingId ? 'Update project' : 'Create project'}
            </Button>
            {editingId ? (
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      ) : null}

      {loading ? (
        <Loading label="Loading projects" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <article key={project._id} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold text-ink">{project.name}</h2>
                  <p className="mt-2 text-sm text-slate-500">{project.description || 'No description provided.'}</p>
                </div>
                {isAdmin ? (
                  <div className="flex gap-1">
                    <button className="focus-ring rounded-md p-2 text-slate-500 hover:bg-slate-50" onClick={() => startEdit(project)}>
                      <Pencil size={16} />
                    </button>
                    <button className="focus-ring rounded-md p-2 text-red-600 hover:bg-red-50" onClick={() => deleteProject(project._id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.members.map((member) => (
                  <span key={member._id} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                    {member.name}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
