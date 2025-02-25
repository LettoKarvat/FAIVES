// src/routes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Appointments from './pages/Appointments';
import Calendar from './pages/Calendar';
import Clients from './pages/Clients';
import Colaboradores from './pages/Colaboradores';

//import Accesses from './pages/Accesses';

// Importa página de detalhes do cliente
import ClientDetail from './pages/ClientDetail';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="clients" element={<Clients />} />
        <Route path="colaboradores" element={<Colaboradores />} />
        {/*   <Route path="accesses" element={<Accesses />} />*/}

        {/* Rota dinâmica /clients/:id */}
        <Route path="clients/:id" element={<ClientDetail />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
