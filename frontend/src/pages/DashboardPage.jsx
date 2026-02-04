import React, { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { useAuth } from "../services/authContext";
import "../styles/dashboard.css";

const DashboardPage = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await apiRequest("/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response);
      } catch (err) {
        setError(err.message);
      }
    };

    loadDashboard();
  }, [token]);

  return (
    <section className="dashboard">
      <header>
        <h2>Resumo do dia</h2>
        <p>Visão rápida das operações da recepção.</p>
      </header>
      {error && <span className="error">{error}</span>}
      <div className="cards">
        <div className="card">
          <strong>{data?.totalClients ?? "-"}</strong>
          <span>Total de clientes</span>
        </div>
        <div className="card">
          <strong>{data?.todayAppointments ?? "-"}</strong>
          <span>Agendamentos do dia</span>
        </div>
        <div className="card">
          <strong>{data?.monthlyBirthdays ?? "-"}</strong>
          <span>Aniversariantes do mês</span>
        </div>
        <div className="card">
          <strong>{data?.discountsUsed ?? "-"}</strong>
          <span>Descontos usados</span>
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
