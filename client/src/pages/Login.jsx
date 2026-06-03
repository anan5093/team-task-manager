import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { apiErrorMessage } from '../utils/formatters.js';

import { Footer } from '../components/Footer.jsx';
import { PromoPanel } from '../components/PromoPanel.jsx';

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
    <main className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="flex flex-1 flex-col-reverse lg:flex-row w-full">
        {/* LEFT PANEL */}
        <PromoPanel />

        {/* RIGHT PANEL */}
        <section className="flex w-full flex-none items-center justify-center px-4 py-10 lg:w-[520px]">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm rounded-2xl bg-white/5 backdrop-blur-lg p-8 shadow-xl ring-1 ring-white/10"
          >
            <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-400">
              Log in to continue managing your team.
            </p>

            {error ? (
              <p className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400 border border-red-500/20">
                {error}
              </p>
            ) : null}

            <div className="mt-6 space-y-4">
              <Input
                label="Email"
                type="email"
                dark
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
              <Input
                label="Password"
                type="password"
                dark
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
            </div>

            <Button
              type="submit"
              className="mt-6 w-full bg-teal-500 hover:bg-teal-600 transition-all"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <p className="mt-5 text-center text-sm text-slate-400">
              New here?{' '}
              <Link to="/signup" className="font-semibold text-teal-400 hover:underline">
                Create an account
              </Link>
            </p>
          </form>
        </section>
      </div>
      <Footer />
    </main>
  );
};

export default Login;
