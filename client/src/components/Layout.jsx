import { FileText, FolderKanban, LayoutDashboard, ListTodo, LogOut, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import { Button } from './Button.jsx';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tasks', label: 'Task Board', icon: ListTodo },
  { to: '/contracts', label: 'Contracts', icon: FileText }
];

const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/5 bg-slate-950/40 backdrop-blur-md px-5 py-6 lg:block">
        <div className="mb-8">
          <p className="text-lg font-bold text-teal-400">Team Task Manager</p>
          <p className="mt-1 text-sm text-slate-400">Project work, neatly contained.</p>
        </div>
        <nav className="space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-all ${
                  isActive ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-white/5 bg-slate-950/40 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="lg:hidden">
              <p className="text-base font-bold text-teal-400">Team Task Manager</p>
            </div>
            <nav className="flex gap-1 lg:hidden">
              {links.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  title={label}
                  className={({ isActive }) =>
                    `rounded-md p-2 transition-all ${isActive ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'text-slate-400 hover:text-white'}`
                  }
                >
                  <Icon size={18} />
                </NavLink>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden items-center gap-2 text-sm sm:flex">
                <Users size={16} className="text-slate-400" />
                <span className="font-semibold text-white">{user?.name}</span>
                <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-semibold uppercase text-slate-300">
                  {user?.role}
                </span>
              </div>
              <Button variant="secondary" onClick={logout} className="bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10">
                <LogOut size={16} />
                Logout
              </Button>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
