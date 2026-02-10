import React, { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { useAuth } from "../services/authContext";
import "../styles/appointments.css";

const AppointmentsPage = () => {
  const { token } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);

  const [formData, setFormData] = useState({
    id: "",
    date: "",
    clientId: "",
    barberId: "",
    serviceId: "",
    notes: "",
    discountCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [discountInfo, setDiscountInfo] = useState(null);

  // =========================
  // LOAD DATA
  // =========================
  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        appointmentsRes,
        clientsRes,
        barbersRes,
        servicesRes,
      ] = await Promise.all([
        apiRequest("/appointments/today", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiRequest("/clients", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiRequest("/barbers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiRequest("/services", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const toList = (res) =>
        Array.isArray(res) ? res : (res?.data ?? []);

      setAppointments(toList(appointmentsRes?.data ?? appointmentsRes));
      setClients(toList(clientsRes));
      setBarbers(toList(barbersRes));
      setServices(toList(servicesRes));
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  // =========================
  // HANDLERS
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "discountCode") {
      setDiscountInfo(null);
      setError("");
    }
  };

  // =========================
  // VALIDAR DESCONTO
  // =========================
  const validateDiscount = async () => {
    if (!formData.discountCode) return;

    try {
      const response = await apiRequest(
        `/discounts/validate?code=${formData.discountCode}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.success) {
        setDiscountInfo(null);
        setError(response.message);
        return;
      }

      setDiscountInfo(response.data);
      setError("");
    } catch (err) {
      setDiscountInfo(null);
      setError("Código de desconto inválido");
    }
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (formData.id) {
        // EDITAR
        const response = await apiRequest(`/appointments/${formData.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.success) {
          setError(response.message);
          return;
        }

        setAppointments((prev) =>
          prev.map((a) =>
            a.id === response.data.id ? response.data : a
          )
        );
      } else {
        // CRIAR
        const response = await apiRequest("/appointments", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.success) {
          setError(response.message);
          return;
        }

        setAppointments((prev) => [...prev, response.data]);

        if (response.message) {
          alert(response.message);
        }
      }

      // RESET FORM
      setFormData({
        id: "",
        date: "",
        clientId: "",
        barberId: "",
        serviceId: "",
        notes: "",
        discountCode: "",
      });

      setDiscountInfo(null);
    } catch (err) {
      console.error(err);
      setError("Erro inesperado");
    }
  };

  // =========================
  // CANCELAR
  // =========================
  const handleCancel = async (id) => {
    if (!window.confirm("Deseja cancelar este agendamento?")) return;

    try {
      const response = await apiRequest(`/appointments/${id}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.success) {
        setError(response.message);
        return;
      }

      setAppointments((prev) =>
        prev.filter((a) => a.id !== id)
      );
    } catch (err) {
      setError("Erro ao cancelar agendamento.");
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEditClick = (appt) => {
    setFormData({
      id: appt.id,
      date: new Date(appt.date).toISOString().slice(0, 16),
      clientId: appt.client.id,
      barberId: appt.barber.id,
      serviceId: appt.service.id,
      notes: appt.notes || "",
      discountCode: "",
    });

    setDiscountInfo(null);
    setError("");
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <section className="appointments-page">
      <header className="page-header">
        <h2>Agendamentos</h2>
        <p>Novos agendamentos e lista do dia.</p>
      </header>

      {error && <p className="error">{error}</p>}

      <form className="card appointment-form" onSubmit={handleSubmit}>
        <h3>{formData.id ? "Editar" : "Novo"} agendamento</h3>

        <div className="form-grid form-row-1">
          <label>
            <span>Data e hora</span>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            <span>Cliente</span>
            <select name="clientId" value={formData.clientId} onChange={handleChange} required>
              <option value="">Selecione o cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Barbeiro</span>
            <select name="barberId" value={formData.barberId} onChange={handleChange} required>
              <option value="">Selecione o barbeiro</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-grid form-row-2">
          <label>
            <span>Serviço</span>
            <select name="serviceId" value={formData.serviceId} onChange={handleChange} required>
              <option value="">Selecione o serviço</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — R$ {Number(s.price || 0).toFixed(2)}
                </option>
              ))}
            </select>
          </label>
          <label className="span-full">
            <span>Observações</span>
            <textarea
              name="notes"
              placeholder="Opcional"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </label>
        </div>

        <div className="form-grid form-row-3">
          <label>
            <span>Código de desconto</span>
            <input
              name="discountCode"
              placeholder="Ex: MB-XXXXXX"
              value={formData.discountCode}
              onChange={handleChange}
              onBlur={validateDiscount}
            />
          </label>
          <div className="form-actions">
            {discountInfo && (
              <span className="success discount-ok">🎉 {discountInfo.percent}% de desconto</span>
            )}
            <button type="submit" className="btn-primary">Salvar</button>
          </div>
        </div>
      </form>

      <div className="card list-card">
        <h3>Agendamentos de hoje</h3>
        <ul className="appointment-list">
          {appointments.map((a) => (
            <li key={a.id} className="appointment-item">
              <div className="appointment-info">
                <strong>{a.client.name}</strong>
                <span className="appointment-service">{a.service.name}</span>
                <span className="appointment-time">
                  {new Date(a.date).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className={`status-badge status-${(a.status || "").toLowerCase()}`}>
                  {a.status === "AGENDADO" ? "Em espera" : a.status === "CONCLUIDO" ? "Concluído" : "Cancelado"}
                </span>
              </div>
              {a.status !== "CANCELADO" && (
                <div className="appointment-actions">
                  <button type="button" className="btn-editar" onClick={() => handleEditClick(a)}>Editar</button>
                  <button type="button" className="btn-cancel" onClick={() => handleCancel(a.id)}>Cancelar</button>
                </div>
              )}
            </li>
          ))}
        </ul>
        {appointments.length === 0 && <p className="empty-text">Nenhum agendamento para hoje.</p>}
      </div>
    </section>
  );
};

export default AppointmentsPage;
