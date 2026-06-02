import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { apiErrorMessage } from '../utils/formatters.js';

import { Footer } from '../components/Footer.jsx';
import { PromoPanel } from '../components/PromoPanel.jsx';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.name || !form.email || form.password.length < 6) {
      setError('Name, valid email, and a 6-character password are required.');
      return;
    }

    setLoading(true);
    try {
      await signup(form);
      navigate('/');
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="flex flex-1 flex-col lg:flex-row w-full">
        {/* LEFT PANEL */}
        <PromoPanel />

        {/* RIGHT PANEL */}
        <section className="flex w-full items-center justify-center px-4 py-10 lg:w-[520px]">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm rounded-2xl bg-white/5 backdrop-blur-lg p-8 shadow-xl ring-1 ring-white/10"
          >
            <h1 className="text-2xl font-semibold text-white">
              Create your workspace account
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              The first registered user is automatically made an admin.
            </p>

            {error ? (
              <p className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400 border border-red-500/20">
                {error}
              </p>
            ) : null}

            <div className="mt-6 space-y-4">
              <Input
                label="Name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
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

            <Button
              type="submit"
              className="mt-6 w-full bg-teal-500 hover:bg-teal-600 transition-all"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>

            <p className="mt-5 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-teal-400 hover:underline">
                Login
              </Link>
            </p>
          </form>
        </section>
      </div>
      <Footer />
    </main>
  );
};

export default Signup;
