import React, { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { useAuth } from "../services/authContext";
import "../styles/clients.css";

const ClientsPage = () => {
  const { token } = useAuth();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    birthDate: "",
    preferences: ""
  });

  const loadClients = async () => {
    const data = await apiRequest(`/clients?search=${search}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setClients(data);
  };

  useEffect(() => {
    loadClients();
  }, [search]);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await apiRequest("/clients", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    setFormData({ name: "", phone: "", email: "", birthDate: "", preferences: "" });
    loadClients();
  };

  return (
    <section className="clients-page">
      <header>
        <h2>Clientes</h2>
        <p>Cadastre clientes e acompanhe preferências e histórico.</p>
      </header>
      <div className="clients-grid">
        <form className="card" onSubmit={handleSubmit}>
          <h3>Novo cliente</h3>
          <label>
            Nome
            <input name="name" value={formData.name} onChange={handleChange} required />
          </label>
          <label>
            Telefone
            <input name="phone" value={formData.phone} onChange={handleChange} required />
          </label>
          <label>
            E-mail
            <input name="email" value={formData.email} onChange={handleChange} type="email" />
          </label>
          <label>
            Data de nascimento
            <input name="birthDate" value={formData.birthDate} onChange={handleChange} type="date" required />
          </label>
          <label>
            Preferências
            <textarea name="preferences" value={formData.preferences} onChange={handleChange} rows="3" />
          </label>
          <button type="submit">Salvar cliente</button>
        </form>
        <div className="card">
          <div className="search">
            <input
              placeholder="Buscar por nome, telefone ou e-mail"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <ul className="client-list">
            {clients.map((client) => (
              <li key={client.id}>
                <div>
                  <strong>{client.name}</strong>
                  <span>{client.phone}</span>
                  <small>{client.email}</small>
                </div>
                <span className="tag">{client.loyaltyPoints} pontos</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ClientsPage;
