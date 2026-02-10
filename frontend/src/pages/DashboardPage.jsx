import React, { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { useAuth } from "../services/authContext";
import "../styles/dashboard.css";

const DashboardPage = () => {
  const { token, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Função para carregar os dados do dashboard
  const loadDashboard = async () => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest("/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response);
    } catch (err) {
      console.error(err);
      if (err.message === "Token inválido") {
        logout();
        setError("Sua sessão expirou. Faça login novamente.");
      } else {
        setError("Erro ao carregar dashboard.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Carrega os dados inicialmente e cria intervalo para atualizar automaticamente
  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard();
    }, 5000); // Atualiza a cada 5 segundos

    return () => clearInterval(interval); // Limpa intervalo ao desmontar
  }, [token, logout]);

  if (loading) return <p>Carregando dashboard...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!data) return null;

  const statusLabel = {
    AGENDADO: "Em espera",
    CONCLUIDO: "Concluído",
    CANCELADO: "Cancelado",
  };

  const today = new Date();
  const appointmentsToday = data.recentAppointments.filter((appt) => {
    const apptDate = new Date(appt.date);
    return (
      apptDate.getDate() === today.getDate() &&
      apptDate.getMonth() === today.getMonth() &&
      apptDate.getFullYear() === today.getFullYear()
    );
  });

  return (
    <section className="dashboard">
      <header>
        <h2>Resumo do dia</h2>
        <p>Visão rápida das operações da recepção.</p>
      </header>

      <div className="cards">
        <div className="card total-clients">
          <strong>{data.totalClients}</strong>
          <span>Total de clientes</span>
        </div>
        <div className="card total-barbers">
          <strong>{data.totalBarbers}</strong>
          <span>Total de barbeiros</span>
        </div>
        <div className="card total-appointments">
          <strong>{data.totalAppointments}</strong>
          <span>Total de agendamentos</span>
        </div>
        <div className="card today-appointments">
          <strong>{appointmentsToday.length}</strong>
          <span>Agendamentos do dia</span>
        </div>
      </div>

      <div className="recent-appointments card">
        <h3>Últimos 5 Agendamentos</h3>
        {data.recentAppointments.length === 0 ? (
          <p>Nenhum agendamento recente.</p>
        ) : (
          <ul>
            {data.recentAppointments.map((appt) => (
              <li key={appt.id}>
                <div className="appt-row">
                  <div>
                    <strong>{appt.client.name}</strong> - {appt.service.name}
                  </div>
                  <span
                    className={`status-badge status-${(appt.status || "AGENDADO").toLowerCase()}`}
                  >
                    {statusLabel[appt.status] ?? appt.status}
                  </span>
                </div>
                <div>
                  Barbeiro: {appt.barber.name} | Data:{" "}
                  {new Date(appt.date).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default DashboardPage;
