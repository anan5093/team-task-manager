export const Input = ({ label, error, dark = false, ...props }) => (
  <label className="block">
    <span className={`mb-1 block text-sm font-medium ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{label}</span>
    <input
      className={`focus-ring w-full rounded-md px-3 py-2 text-sm shadow-sm transition-all ${
        dark
          ? 'border-white/10 bg-slate-900/50 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-teal-500'
          : 'border-slate-200 bg-white text-ink focus:border-brand'
      }`}
      {...props}
    />
    {error ? <span className={`mt-1 block text-xs ${dark ? 'text-red-400' : 'text-red-600'}`}>{error}</span> : null}
  </label>
);

export const Textarea = ({ label, error, dark = false, ...props }) => (
  <label className="block">
    <span className={`mb-1 block text-sm font-medium ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{label}</span>
    <textarea
      className={`focus-ring min-h-24 w-full rounded-md px-3 py-2 text-sm shadow-sm transition-all ${
        dark
          ? 'border-white/10 bg-slate-900/50 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-teal-500'
          : 'border-slate-200 bg-white text-ink focus:border-brand'
      }`}
      {...props}
    />
    {error ? <span className={`mt-1 block text-xs ${dark ? 'text-red-400' : 'text-red-600'}`}>{error}</span> : null}
  </label>
);

export const Select = ({ label, children, error, dark = false, ...props }) => (
  <label className="block">
    <span className={`mb-1 block text-sm font-medium ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{label}</span>
    <select
      className={`focus-ring w-full rounded-md px-3 py-2 text-sm shadow-sm transition-all ${
        dark
          ? 'border-white/10 bg-slate-900/50 text-white focus:border-teal-500 focus:ring-teal-500'
          : 'border-slate-200 bg-white text-ink focus:border-brand'
      }`}
      {...props}
    >
      {children}
    </select>
    {error ? <span className={`mt-1 block text-xs ${dark ? 'text-red-400' : 'text-red-600'}`}>{error}</span> : null}
  </label>
);
