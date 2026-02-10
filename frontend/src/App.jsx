import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ClientsPage from "./pages/ClientsPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import BarbersPage from "./pages/BarbersPage";
import ServicesPage from "./pages/ServicesPage";
import DiscountsPage from "./pages/DiscountsPage";
import Layout from "./components/Layout";
import { AuthProvider, useAuth } from "./services/authContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App = () => (
  <AuthProvider>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="/clientes" element={<ClientsPage />} />
        <Route path="/agendamentos" element={<AppointmentsPage />} />
        <Route path="/barbeiros" element={<BarbersPage />} />
        <Route path="/servicos" element={<ServicesPage />} />
        <Route path="/descontos" element={<DiscountsPage />} />
      </Route>
    </Routes>
  </AuthProvider>
);

export default App;
