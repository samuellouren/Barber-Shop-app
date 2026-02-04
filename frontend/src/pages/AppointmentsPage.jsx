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
    date: "",
    clientId: "",
    barberId: "",
    serviceId: "",
    notes: "",
    discountCode: ""
  });

  const loadData = async () => {
    const [appointmentsData, clientsData, barbersData, servicesData] = await Promise.all([
      apiRequest("/appointments/today", { headers: { Authorization: `Bearer ${token}` } }),
      apiRequest("/clients", { headers: { Authorization: `Bearer ${token}` } }),
      apiRequest("/barbers", { headers: { Authorization: `Bearer ${token}` } }),
      apiRequest("/services", { headers: { Authorization: `Bearer ${token}` } })
    ]);
    setAppointments(appointmentsData);
    setClients(clientsData);
    setBarbers(barbersData);
    setServices(servicesData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await apiRequest("/appointments", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    setFormData({
      date: "",
      clientId: "",
      barberId: "",
      serviceId: "",
      notes: "",
      discountCode: ""
    });
    loadData();
  };

  return (
    <section className="appointments-page">
      <header>
        <h2>Agendamentos</h2>
        <p>Crie e acompanhe a agenda diária dos barbeiros.</p>
      </header>
      <div className="appointments-grid">
        <form className="card" onSubmit={handleSubmit}>
          <h3>Novo agendamento</h3>
          <label>
            Data e hora
            <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} required />
          </label>
          <label>
            Cliente
            <select name="clientId" value={formData.clientId} onChange={handleChange} required>
              <option value="">Selecione</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Barbeiro
            <select name="barberId" value={formData.barberId} onChange={handleChange} required>
              <option value="">Selecione</option>
              {barbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Serviço
            <select name="serviceId" value={formData.serviceId} onChange={handleChange} required>
              <option value="">Selecione</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Observações
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" />
          </label>
          <label>
            Código de desconto (opcional)
            <input name="discountCode" value={formData.discountCode} onChange={handleChange} />
          </label>
          <button type="submit">Salvar agendamento</button>
        </form>
        <div className="card">
          <h3>Agenda do dia</h3>
          <ul className="appointment-list">
            {appointments.map((appointment) => (
              <li key={appointment.id}>
                <div>
                  <strong>{appointment.client.name}</strong>
                  <span>
                    {new Date(appointment.date).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                    {" "}
                    · {appointment.service.name}
                  </span>
                  <small>Barbeiro: {appointment.barber.name}</small>
                </div>
                <span className={`status ${appointment.status.toLowerCase()}`}>
                  {appointment.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default AppointmentsPage;
