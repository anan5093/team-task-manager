export const Button = ({ children, className = '', variant = 'primary', ...props }) => {
  const styles = {
    primary: 'bg-brand text-white hover:bg-teal-800 disabled:bg-teal-300',
    secondary: 'bg-white text-ink ring-1 ring-slate-200 hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300'
  };

  return (
    <button
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
