export const formatDate = (value) => {
  if (!value) return 'No date';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));
};

export const isOverdue = (task) => task.status !== 'done' && new Date(task.dueDate) < new Date();

export const apiErrorMessage = (error) =>
  error.response?.data?.errors?.[0]?.message || error.response?.data?.message || 'Something went wrong';
