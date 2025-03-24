// src/routes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Appointments from './pages/Appointments';
import Clients from './pages/Clients';
import Colaboradores from './pages/Colaboradores';
import ClientDetail from './pages/ClientDetail';
import ProjectDetail from "./components/ProjectDetail";

const PrivateRoute = ({ children }) => {
  // Verifica se o token de autenticação existe no localStorage
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
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
        {/*
          Aqui definimos o "index" para que, ao acessar "/",
          redirecione para "/projects".
        */}
        <Route index element={<Navigate to="/projects" />} />

        {/* Demais rotas privadas (dentro de Layout) */}
        <Route path="projects" element={<Projects />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="clients" element={<Clients />} />
        <Route path="colaboradores" element={<Colaboradores />} />
        <Route path="clients/:id" element={<ClientDetail />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
