import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { apiErrorMessage } from '../utils/formatters.js';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-surface">
      <section className="hidden flex-1 bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-2xl font-bold">Team Task Manager</p>
          <p className="mt-4 max-w-md text-slate-200">
            Keep projects, ownership, due dates, and delivery signals visible across the team.
          </p>
        </div>
        <div className="grid max-w-md gap-3 text-sm text-slate-200">
          {['JWT-secured access', 'Role-based project control', 'Live dashboard filters'].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-teal-300" />
              {item}
            </div>
          ))}
        </div>
      </section>
      <section className="flex w-full items-center justify-center px-4 py-10 lg:w-[520px]">
        <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Log in to continue managing team work.</p>
          {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          <div className="mt-6 space-y-4">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </div>
          <Button type="submit" className="mt-6 w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          <p className="mt-4 text-center text-sm text-slate-500">
            New here?{' '}
            <Link to="/signup" className="font-semibold text-brand">
              Create an account
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default Login;
