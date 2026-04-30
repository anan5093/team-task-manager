import { Navigate, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Projects from './pages/Projects.jsx';
import Signup from './pages/Signup.jsx';
import TaskBoard from './pages/TaskBoard.jsx';

const PublicOnly = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

const App = () => (
  <Routes>
    <Route
      path="/login"
      element={
        <PublicOnly>
          <Login />
        </PublicOnly>
      }
    />
    <Route
      path="/signup"
      element={
        <PublicOnly>
          <Signup />
        </PublicOnly>
      }
    />
    <Route element={<ProtectedRoute />}>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="tasks" element={<TaskBoard />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
